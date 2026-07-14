import type { Photo } from "./types"

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ""
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ""
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ""
const CLOUDINARY_BASE_FOLDER = process.env.CLOUDINARY_FOLDER || "portfolio"

interface CloudinaryResource {
  public_id: string
  secure_url: string
  width: number
  height: number
  created_at?: string
  context?: {
    custom?: {
      alt?: string
    }
  }
  // Present only when the search request sets `image_metadata: true`.
  // Cloudinary returns raw EXIF key/value pairs as strings, e.g.
  // { "Make": "SONY", "Model": "ILCE-7RM3", "FNumber": "2.8", ... }.
  // Only present for assets uploaded after scripts/cloudinary_upload.py
  // started preserving a trimmed EXIF subset -- older assets that were
  // uploaded with EXIF fully stripped will have this be empty/absent.
  image_metadata?: Record<string, string>
}

type FolderQuery = string | string[]

function assertCloudinaryConfig() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary environment variables.")
  }
}

function buildFolderExpression(folder: FolderQuery) {
  const folders = Array.isArray(folder) ? folder : [folder]
  const clauses = folders.map((value) => {
    const sanitized = value.replace(/"/g, '\\"')
    return `folder="${sanitized}"`
  })
  return clauses.join(" OR ")
}

function buildAuthHeader() {
  const token = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64")
  return `Basic ${token}`
}

function slugToTitle(slug: string) {
  return slug
    .split("/")
    .pop()
    ?.replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Photo"
}

// Cloudinary's documented image_metadata response uses EXIF field names
// (e.g. "Make", "Model", "FNumber"), but exact key casing isn't guaranteed
// to be stable across API versions, so lookups here are case-insensitive
// and check a few known aliases per field.
function getMetadataField(
  imageMetadata: Record<string, string> | undefined,
  keys: string[]
): string | undefined {
  if (!imageMetadata) return undefined

  for (const key of keys) {
    const value = imageMetadata[key]
    if (value) return value
  }

  const lowerCaseMap: Record<string, string> = {}
  for (const [k, v] of Object.entries(imageMetadata)) {
    lowerCaseMap[k.toLowerCase()] = v
  }
  for (const key of keys) {
    const value = lowerCaseMap[key.toLowerCase()]
    if (value) return value
  }

  return undefined
}

// EXIF rational values may arrive as a plain number string ("2.8"), or as
// a "numerator/denominator" fraction string ("28/10"). Handle both.
function parseExifRational(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (trimmed.includes("/")) {
    const [numStr, denStr] = trimmed.split("/")
    const numerator = Number(numStr)
    const denominator = Number(denStr)
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null
    }
    return numerator / denominator
  }

  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

// Formats a number with at most `maxDecimals` places, dropping a
// trailing ".0" so "2.0" reads as "2" but "2.8" is preserved.
function formatTrimmedNumber(value: number, maxDecimals: number): string {
  const rounded = Number(value.toFixed(maxDecimals))
  return String(rounded)
}

function formatAperture(raw: string | undefined): string {
  if (!raw) return ""
  const value = parseExifRational(raw)
  if (value === null || value <= 0) return ""
  return `f/${formatTrimmedNumber(value, 1)}`
}

function formatShutterSpeed(raw: string | undefined): string {
  if (!raw) return ""
  const trimmed = raw.trim()

  // Already a "numerator/denominator" fraction (the common EXIF shape
  // for sub-second exposures, e.g. "1/500") -- keep it as-is.
  if (/^\d+\/\d+$/.test(trimmed)) {
    return `${trimmed}s`
  }

  const value = parseExifRational(trimmed)
  if (value === null || value <= 0) return ""

  if (value >= 1) {
    return `${formatTrimmedNumber(value, 1)}s`
  }

  const denominator = Math.round(1 / value)
  return denominator > 0 ? `1/${denominator}s` : ""
}

function formatIso(raw: string | undefined): string {
  if (!raw) return ""
  const value = parseExifRational(raw)
  if (value === null || value <= 0) return ""
  return String(Math.round(value))
}

function formatFocalLength(raw: string | undefined): string {
  if (!raw) return ""
  const value = parseExifRational(raw)
  if (value === null || value <= 0) return ""
  return `${formatTrimmedNumber(value, 1)}mm`
}

function buildPhotoMetadata(resource: CloudinaryResource) {
  const imageMetadata = resource.image_metadata

  const make = getMetadataField(imageMetadata, ["Make"])
  const model = getMetadataField(imageMetadata, ["Model"])
  const lensModel = getMetadataField(imageMetadata, ["LensModel", "LensInfo", "Lens"])
  const lensMake = getMetadataField(imageMetadata, ["LensMake"])
  const fNumber = getMetadataField(imageMetadata, ["FNumber", "ApertureValue"])
  const exposureTime = getMetadataField(imageMetadata, ["ExposureTime", "ShutterSpeedValue"])
  const iso = getMetadataField(imageMetadata, ["ISOSpeedRatings", "PhotographicSensitivity", "ISO"])
  const focalLength = getMetadataField(imageMetadata, ["FocalLength"])

  let camera = ""
  if (model && make && !model.toLowerCase().includes(make.toLowerCase())) {
    camera = `${make} ${model}`
  } else if (model) {
    camera = model
  } else if (make) {
    camera = make
  }

  let lens = ""
  if (lensModel && lensMake && !lensModel.toLowerCase().includes(lensMake.toLowerCase())) {
    lens = `${lensMake} ${lensModel}`
  } else if (lensModel) {
    lens = lensModel
  } else if (lensMake) {
    lens = lensMake
  }

  return {
    camera,
    lens,
    aperture: formatAperture(fNumber),
    shutterSpeed: formatShutterSpeed(exposureTime),
    iso: formatIso(iso),
    focalLength: formatFocalLength(focalLength),
    takenAt: resource.created_at ? resource.created_at.split("T")[0] : "",
  }
}

export async function fetchCloudinaryPhotos(folder: FolderQuery, maxResults: number = 120): Promise<Photo[]> {
  assertCloudinaryConfig()

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: buildAuthHeader(),
    },
    body: JSON.stringify({
      expression: buildFolderExpression(folder),
      max_results: maxResults,
      sort_by: [{ created_at: "desc" }],
      image_metadata: true,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cloudinary search failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  const resources = (data.resources || []) as CloudinaryResource[]

  return resources.map((resource) => ({
    id: resource.public_id,
    src: resource.secure_url,
    width: resource.width,
    height: resource.height,
    alt: resource.context?.custom?.alt || slugToTitle(resource.public_id),
    metadata: buildPhotoMetadata(resource),
  }))
}

export async function fetchAllCloudinaryPhotos(maxResults: number = 500): Promise<Photo[]> {
  assertCloudinaryConfig()

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: buildAuthHeader(),
    },
    body: JSON.stringify({
      expression: `folder:${CLOUDINARY_BASE_FOLDER}/*`,
      max_results: maxResults,
      sort_by: [{ created_at: "desc" }],
      image_metadata: true,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Cloudinary search failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  const resources = (data.resources || []) as CloudinaryResource[]

  return resources.map((resource) => ({
    id: resource.public_id,
    src: resource.secure_url,
    width: resource.width,
    height: resource.height,
    alt: resource.context?.custom?.alt || slugToTitle(resource.public_id),
    metadata: buildPhotoMetadata(resource),
  }))
}

export function getCloudinaryFolder(slug: string): FolderQuery {
  // Map slugs to actual Cloudinary folder names
  const folderMapping: Record<string, string | string[]> = {
    "portraits-beach": "Portraits - Beach",
    "portraits-family": "Portraits - Family",
    "portraits-graduation": "Portraits - Graduation",
    "portraits-nj-moments": "Portraits - NJ Moments",
    "portraits-metuchen": "Portraits - Metuchen",
    "landscapes-dallas": "Landscapes - Dallas",
    "landscapes-nature": ["Landscapes - Nature", "trails"],
    "commercial-jewelry": "Commercial - Jewelry",
    "events": ["mata24 event", "nats event", "svm-events", "new-year-23"],
    "nyc": "nyc",
    "europe": "Europe",
    "random": "random",
    "author": "Author",
    "automobiles": "automobiles",
    "nightlife": "nightlife",
  }

  const actualFolder = folderMapping[slug] || slug
  if (Array.isArray(actualFolder)) {
    return actualFolder.map((folder) => `${CLOUDINARY_BASE_FOLDER}/${folder}`)
  }
  return `${CLOUDINARY_BASE_FOLDER}/${actualFolder}`
}
