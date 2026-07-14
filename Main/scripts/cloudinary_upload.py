#!/usr/bin/env python3
import argparse
import os
import re
from io import BytesIO
from pathlib import Path

from PIL import Image
import cloudinary
import cloudinary.uploader

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

# EXIF tag IDs that live in the top-level IFD0.
_ALLOWED_IFD0_TAGS = {
    271,  # Make
    272,  # Model
}

# The rest of the technical/exposure tags live in the "Exif" sub-IFD,
# pointed to from IFD0 by tag 34665 (0x8769).
_EXIF_SUBIFD_TAG = 0x8769  # 34665
_ALLOWED_EXIF_SUBIFD_TAGS = {
    33434,  # ExposureTime
    33437,  # FNumber
    34855,  # ISOSpeedRatings (aka PhotographicSensitivity)
    37386,  # FocalLength
    42035,  # LensMake
    42036,  # LensModel
}

# Everything NOT in the allowlists above is dropped, which in particular
# means GPSInfo (tag 34853 / 0x8825, and its entire sub-IFD) is always
# stripped, along with any owner-name/serial-number/user-comment tags.


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-")


def _build_trimmed_exif(source_exif) -> bytes | None:
    """Build a minimal EXIF blob containing only an allowlist of safe,
    non-identifying technical tags (camera make/model, lens, exposure
    settings). Deliberately excludes GPSInfo and every other tag/IFD
    (owner name, serial number, comments, thumbnails, etc.) -- that's the
    privacy protection strip_exif originally existed to provide, and it's
    preserved here even though we now keep a subset of tags.
    """
    if not source_exif:
        return None

    trimmed = Image.Exif()
    has_data = False

    for tag_id in _ALLOWED_IFD0_TAGS:
        if tag_id in source_exif:
            trimmed[tag_id] = source_exif[tag_id]
            has_data = True

    try:
        source_exif_subifd = source_exif.get_ifd(_EXIF_SUBIFD_TAG)
    except Exception:
        source_exif_subifd = {}

    if source_exif_subifd:
        trimmed_exif_subifd = trimmed.get_ifd(_EXIF_SUBIFD_TAG)
        for tag_id in _ALLOWED_EXIF_SUBIFD_TAGS:
            if tag_id in source_exif_subifd:
                trimmed_exif_subifd[tag_id] = source_exif_subifd[tag_id]
                has_data = True

    if not has_data:
        return None

    return trimmed.tobytes()


def strip_exif(image_path: Path) -> BytesIO:
    with Image.open(image_path) as img:
        format_name = img.format or image_path.suffix.replace(".", "").upper()
        if format_name.upper() == "JPG":
            format_name = "JPEG"

        # Read EXIF before any resize/recompress below -- Pillow drops EXIF
        # on re-save unless it's explicitly re-attached via save_kwargs.
        # Only a trimmed, privacy-safe allowlist of tags is carried
        # forward; see _build_trimmed_exif for exactly what's kept
        # (notably: no GPS, no owner/serial/comment fields).
        trimmed_exif_bytes = _build_trimmed_exif(img.getexif())

        save_kwargs = {}
        if trimmed_exif_bytes:
            save_kwargs["exif"] = trimmed_exif_bytes
        if format_name.upper() in {"JPEG", "JPG"}:
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            save_kwargs.update({"quality": 92, "optimize": True})
        elif format_name.upper() == "PNG":
            save_kwargs.update({"optimize": True})
        elif format_name.upper() == "WEBP":
            save_kwargs.update({"quality": 90, "method": 6})

        current_img = img.copy()
        quality = save_kwargs.get("quality", 92)
        scale = 1.0

        while True:
            output = BytesIO()
            resized_img = (
                current_img.resize(
                    (
                        max(1, int(current_img.width * scale)),
                        max(1, int(current_img.height * scale)),
                    ),
                    Image.LANCZOS,
                )
                if scale < 1.0
                else current_img
            )

            kwargs = dict(save_kwargs)
            if format_name.upper() in {"JPEG", "JPG", "WEBP"} and "quality" in kwargs:
                kwargs["quality"] = int(max(16, quality))

            resized_img.save(output, format=format_name, **kwargs)
            size = output.tell()

            if size <= MAX_UPLOAD_BYTES or (scale < 0.5 and quality <= 30):
                output.seek(0)
                return output

            if format_name.upper() in {"JPEG", "JPG", "WEBP"}:
                quality *= 0.85
            else:
                scale *= 0.9

            scale = max(0.4, scale)


def configure_cloudinary():
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
    api_key = os.environ.get("CLOUDINARY_API_KEY", "")
    api_secret = os.environ.get("CLOUDINARY_API_SECRET", "")

    if not cloud_name or not api_key or not api_secret:
        raise RuntimeError("Missing Cloudinary environment variables.")

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def upload_file(image_path: Path, folder: str, dry_run: bool) -> None:
    slug = slugify(image_path.stem)
    payload = strip_exif(image_path)

    if dry_run:
        print(f"DRY RUN: {image_path.name} -> {folder}/{slug}")
        return

    cloudinary.uploader.upload(
        payload,
        folder=folder,
        public_id=slug,
        overwrite=False,
        unique_filename=False,
        resource_type="image",
        context=f"alt={slug.replace('-', ' ')}",
        # The uploaded file only carries the trimmed, GPS-free EXIF subset
        # built in strip_exif -- image_metadata=True just tells Cloudinary
        # to extract/store whatever EXIF is present (i.e. that subset) so
        # it's queryable later via the Admin API's image_metadata flag.
        image_metadata=True,
    )
    print(f"Uploaded: {image_path.name} -> {folder}/{slug}")


def resolve_collections(input_dir: Path, collection: str | None):
    subdirs = [d for d in input_dir.iterdir() if d.is_dir()]
    if subdirs:
        return [(slugify(d.name), d) for d in subdirs]

    if not collection:
        raise RuntimeError("No subfolders found. Provide --collection for a flat folder.")

    return [(slugify(collection), input_dir)]


def main() -> None:
    parser = argparse.ArgumentParser(description="Strip EXIF and upload images to Cloudinary.")
    parser.add_argument("--input", required=True, help="Path to local photo folder.")
    parser.add_argument("--collection", help="Collection slug to use when input has no subfolders.")
    parser.add_argument("--folder", default=os.environ.get("CLOUDINARY_FOLDER", "portfolio"), help="Base Cloudinary folder.")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without uploading.")
    args = parser.parse_args()

    input_dir = Path(args.input).expanduser().resolve()
    if not input_dir.exists():
        raise RuntimeError(f"Input folder does not exist: {input_dir}")

    configure_cloudinary()

    collections = resolve_collections(input_dir, args.collection)
    for slug, folder_path in collections:
        cloudinary_folder = f"{args.folder}/{slug}"
        images = [p for p in folder_path.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS]
        if not images:
            print(f"No images found in {folder_path}")
            continue

        for image_path in images:
            upload_file(image_path, cloudinary_folder, args.dry_run)


if __name__ == "__main__":
    main()
