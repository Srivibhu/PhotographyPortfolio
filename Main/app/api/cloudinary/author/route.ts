import { NextResponse } from "next/server"
import { fetchCloudinaryPhotos, getCloudinaryFolder } from "@/lib/cloudinary"

const CACHE_CONTROL = "s-maxage=86400, stale-while-revalidate=604800"

export async function GET() {
  try {
    const folder = getCloudinaryFolder("author")
    const photos = await fetchCloudinaryPhotos(folder, 1)
    return NextResponse.json(
      {
        image: photos[0]?.src || "",
      },
      { headers: { "Cache-Control": CACHE_CONTROL } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
