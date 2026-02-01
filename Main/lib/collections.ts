import type { Collection } from "./types"
import { fetchCloudinaryPhotos, getCloudinaryFolder } from "./cloudinary"

const collectionConfigs = [
  {
    id: "1",
    slug: "portraits-beach",
    title: "Beach Portraits",
    description: "Sunlit portraits with coastal light and wind",
    fullDescription:
      "Ocean mornings, soft haze, and the energy of shoreline breezes. A portrait series shaped by salt air and reflective light.",
    tags: ["Portraits", "Beach", "Coastal"],
    featured: true,
  },
  {
    id: "2",
    slug: "portraits-family",
    title: "Family Portraits",
    description: "Warm, candid family storytelling",
    fullDescription:
      "Natural, relaxed moments that highlight connection, joy, and the details that make each family unique.",
    tags: ["Portraits", "Family", "Lifestyle"],
    featured: true,
  },
  {
    id: "3",
    slug: "portraits-graduation",
    title: "Graduation Portraits",
    description: "Milestone portraits with energy and pride",
    fullDescription:
      "Cap-and-gown portraits with celebratory details, captured with a bright, confident visual style.",
    tags: ["Portraits", "Graduation", "Milestones"],
    featured: false,
  },
  {
    id: "4",
    slug: "portraits-nj-moments",
    title: "NJ Moments",
    description: "Everyday portraits with a local feel",
    fullDescription:
      "Portraits and candid moments around New Jersey, focused on authenticity and subtle emotion.",
    tags: ["Portraits", "New Jersey", "Lifestyle"],
    featured: false,
  },
  {
    id: "5",
    slug: "portraits-metuchen",
    title: "Metuchen Portraits",
    description: "Portraits around Metuchen",
    fullDescription:
      "A local portrait series with soft light, genuine expression, and a timeless approach.",
    tags: ["Portraits", "Metuchen", "New Jersey"],
    featured: true,
  },
  {
    id: "6",
    slug: "landscapes-dallas",
    title: "Dallas Landscapes",
    description: "Skylines, neighborhoods, and open skies",
    fullDescription:
      "City textures, warm sunsets, and wide-open Dallas light, captured with a cinematic perspective.",
    tags: ["Landscapes", "Dallas", "City"],
    featured: false,
  },
  {
    id: "7",
    slug: "landscapes-nature",
    title: "Nature Landscapes",
    description: "Trails, parks, and natural light",
    fullDescription:
      "Natural landscapes with emphasis on light, texture, and calm atmosphere.",
    tags: ["Landscapes", "Nature", "Outdoors"],
    featured: true,
  },
  {
    id: "8",
    slug: "commercial-jewelry",
    title: "Commercial Jewelry",
    description: "Detail-rich product photography",
    fullDescription:
      "Precision lighting and close-up work focused on texture, materials, and brand polish.",
    tags: ["Commercial", "Jewelry", "Product"],
    featured: false,
  },
  {
    id: "9",
    slug: "events",
    title: "Events",
    description: "Live events, celebrations, and highlights",
    fullDescription:
      "A curated blend of event coverage, from large gatherings to intimate celebrations.",
    tags: ["Events", "Celebration", "Documentary"],
    featured: false,
  },
  {
    id: "10",
    slug: "nyc",
    title: "New York City",
    description: "City stories, street details, and skyline light",
    fullDescription:
      "A portrait of NYC through movement, architecture, and the energy of daily life.",
    tags: ["Travel", "NYC", "City"],
    featured: true,
  },
  {
    id: "11",
    slug: "europe",
    title: "Europe",
    description: "Travel photography across Europe",
    fullDescription:
      "A travel series focused on architecture, culture, and the rhythm of European cities.",
    tags: ["Travel", "Europe", "Architecture"],
    featured: false,
  },
  {
    id: "12",
    slug: "trails",
    title: "Trails",
    description: "Hikes, paths, and outdoor quiet",
    fullDescription:
      "Trail photography centered on pace, atmosphere, and natural color.",
    tags: ["Outdoors", "Trails", "Nature"],
    featured: false,
  },
  {
    id: "13",
    slug: "random",
    title: "Personal Projects",
    description: "Experiments, in-between moments, and favorites",
    fullDescription:
      "A mix of personal experiments and unassigned work that still deserves a spotlight.",
    tags: ["Personal", "Experimental", "Mixed"],
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

  let photos: Collection["photos"] = []
  let coverImage = ""

  try {
    const folder = getCloudinaryFolder(slug)
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
      let coverImage = ""
      try {
        const folder = getCloudinaryFolder(collection.slug)
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
