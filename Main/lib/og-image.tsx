import { ImageResponse } from "next/og"
import { fetchCloudinaryPhotos, getCloudinaryFolder } from "@/lib/cloudinary"

export const ogImageSize = { width: 1200, height: 630 }

async function getCoverPhoto(): Promise<string | null> {
  try {
    const folder = getCloudinaryFolder("nyc")
    const photos = await fetchCloudinaryPhotos(folder, 1)
    return photos[0]?.src || null
  } catch {
    return null
  }
}

export async function renderShareImage() {
  const coverPhoto = await getCoverPhoto()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#000000",
        }}
      >
        {coverPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverPhoto}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.1) 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 64,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 64, color: "white", fontWeight: 700 }}>Srivibhu Ponakala</div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.85)", marginTop: 12 }}>
            Automotive · Travel · Lifestyle Photography
          </div>
        </div>
      </div>
    ),
    ogImageSize
  )
}
