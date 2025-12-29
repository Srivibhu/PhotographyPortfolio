import type { Collection } from "./types"
import { fetchCloudinaryPhotos, getCloudinaryFolder } from "./cloudinary"

const collectionConfigs = [
  {
    id: "1",
    slug: "2024-grad",
    title: "Class of 2024",
    description: "Graduation moments and proud celebrations",
    fullDescription:
      "Capstone ceremonies, quiet reflections, and the rush of academic milestones—this series documents the textures, expressions, and light that defined the Class of 2024.",
    tags: ["Portrait", "Graduation", "Studio"],
    featured: true,
  },
  {
    id: "2",
    slug: "landscape",
    title: "Landscape Studies",
    description: "Moody skies, reflections, and calm horizons",
    fullDescription:
      "From misty riversides to rim-lit summits, I chase wide-open frames and subtle gradients where the sky meets the earth.",
    tags: ["Landscape", "Nature", "Color"],
    featured: true,
  },
  {
    id: "3",
    slug: "nyc",
    title: "NYC Cityscapes",
    description: "Nightlife, neon, and layered streets",
    fullDescription:
      "New York is a collage of lights and movement. These captures focus on the energy found in rush-hour crowds, silent rooftops, and reflective puddles.",
    tags: ["Street", "Urban", "Night"],
    featured: true,
  },
  {
    id: "4",
    slug: "beach",
    title: "Coastal Light",
    description: "Shorelines, dunes, and salt air",
    fullDescription:
      "Ocean mornings and low-sun glow. This collection borrows pastel walls of fog and the play between sand and surf.",
    tags: ["Beach", "Light", "Seascape"],
    featured: false,
  },
  {
    id: "5",
    slug: "fam",
    title: "Family & Friends",
    description: "Warm, intimate portraits in daily life",
    fullDescription:
      "Documentary-style frames featuring the people who keep me grounded. The emphasis is on authenticity, quiet joy, and shared rituals.",
    tags: ["Portrait", "Documentary", "Family"],
    featured: false,
  },
  {
    id: "6",
    slug: "trails",
    title: "Trails & Wilderness",
    description: "Foggy treelines and rugged paths",
    fullDescription:
      "Long hikes through the woods, close studies of moss and stone, and the way early light filters through dense canopy.",
    tags: ["Outdoor", "Landscape", "Adventure"],
    featured: false,
  },
]

export function getCollectionConfigs() {
  return collectionConfigs
}

export function getAllCollections() {
  return collectionConfigs.map((collection) => ({
    ...collection,
    coverImage: "",
    photos: [],
  }))
}

export function getFeaturedCollectionsConfig() {
  return collectionConfigs.filter((collection) => collection.featured)
}

export function getAllTags() {
  return Array.from(new Set(collectionConfigs.flatMap((collection) => collection.tags)))
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  const config = collectionConfigs.find((collection) => collection.slug === slug)
  if (!config) return undefined

  const folder = getCloudinaryFolder(slug)
  let photos: Collection["photos"] = []
  let coverImage = ""
  try {
    photos = await fetchCloudinaryPhotos(folder)
    coverImage = photos[0]?.src || ""
  } catch (error) {
    photos = []
    coverImage = ""
  }

  return {
    ...config,
    coverImage,
    photos,
  }
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  const featuredConfigs = getFeaturedCollectionsConfig()

  const results = await Promise.all(
    featuredConfigs.map(async (collection) => {
      const folder = getCloudinaryFolder(collection.slug)
      let coverImage = ""
      try {
        const photos = await fetchCloudinaryPhotos(folder, 1)
        coverImage = photos[0]?.src || ""
      } catch (error) {
        coverImage = ""
      }
      return {
        ...collection,
        coverImage,
        photos: [],
      }
    }),
  )

  return results
}
