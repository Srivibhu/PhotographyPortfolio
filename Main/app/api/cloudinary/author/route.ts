import { NextRequest, NextResponse } from "next/server"
import { fetchCloudinaryPhotos, getCloudinaryFolder } from "@/lib/cloudinary"

const CACHE_CONTROL = "s-maxage=86400, stale-while-revalidate=604800"

export async function GET(request: NextRequest) {
  try {
    const requestedCount = Number(request.nextUrl.searchParams.get("count"))
    const count = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 2

    const folder = getCloudinaryFolder("author")
    const photos = await fetchCloudinaryPhotos(folder, count)
    return NextResponse.json(
      {
        // Kept for backwards compatibility with any existing callers of this route.
        image: photos[0]?.src || "",
        images: photos.map((photo) => photo.src),
      },
      { headers: { "Cache-Control": CACHE_CONTROL } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
