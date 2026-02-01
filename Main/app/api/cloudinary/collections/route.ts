import { NextResponse } from "next/server"
import { getCollectionConfigs, getFeaturedCollections } from "@/lib/collections"
import { fetchCloudinaryPhotos, getCloudinaryFolder, fetchAllCloudinaryPhotos } from "@/lib/cloudinary"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get("featured") === "true"
  const all = searchParams.get("all") === "true"
  const allPhotos = searchParams.get("allPhotos") === "true"

  try {
    if (allPhotos) {
      const photos = await fetchAllCloudinaryPhotos()
      return NextResponse.json({ photos })
    }

    if (featured) {
      const collections = await getFeaturedCollections()
      return NextResponse.json({ collections })
    }

    if (all) {
      const configs = getCollectionConfigs()
      const collections = await Promise.all(
        configs.map(async (collection) => {
          const folder = getCloudinaryFolder(collection.slug)
          const photos = await fetchCloudinaryPhotos(folder, 1)
          return {
            ...collection,
            coverImage: photos[0]?.src || "",
            photos: [],
          }
        }),
      )
      return NextResponse.json({ collections })
    }

    return NextResponse.json({ collections: [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
