import type { Collection } from "./types"
import { fetchCloudinaryPhotos, getCloudinaryFolder } from "./cloudinary"

const collectionConfigs = [
  {
    id: "1",
    slug: "portraits-beach",
    title: "Beach Portraits",
    description: "Shorelines, dunes, and salt air",
    fullDescription:
      "Ocean mornings and low-sun glow. This collection borrows pastel walls of fog and the play between sand and surf.",
    tags: ["Beach", "Light", "Seascape"],
    featured: true,
  },
  {
    id: "2",
    slug: "portraits-studio",
    title: "Studio Portraits",
    description: "Professional studio photography",
    fullDescription:
      "Controlled lighting and professional studio environments capturing personality and character.",
    tags: ["Studio", "Portrait", "Professional"],
    featured: true,
  },
  {
    id: "3",
    slug: "portraits-street",
    title: "Street Portraits",
    description: "Candid moments in urban environments",
    fullDescription:
      "Spontaneous portraits captured in the streets, revealing authentic expressions and urban character.",
    tags: ["Street", "Portrait", "Urban"],
    featured: false,
  },
  {
    id: "4",
    slug: "portraits-wedding",
    title: "Wedding Portraits",
    description: "Celebrating love and commitment",
    fullDescription:
      "Intimate moments and joyful celebrations captured during wedding ceremonies and receptions.",
    tags: ["Wedding", "Portrait", "Celebration"],
    featured: false,
  },
  {
    id: "5",
    slug: "landscapes",
    title: "Landscapes",
    description: "Natural and urban landscapes",
    fullDescription:
      "Beautiful landscapes from nature to cityscapes, capturing the beauty of different environments.",
    tags: ["Landscape", "Nature", "Urban"],
    featured: true,
  },
  {
    id: "6",
    slug: "street-photography",
    title: "Street Photography",
    description: "Urban life and street scenes",
    fullDescription:
      "Documentary-style photography capturing the energy and character of street life.",
    tags: ["Street", "Documentary", "Urban"],
    featured: false,
  },
  {
    id: "7",
    slug: "events-birthday",
    title: "Birthday Events",
    description: "Birthday celebrations and parties",
    fullDescription:
      "Joyful birthday celebrations captured with energy and emotion.",
    tags: ["Events", "Birthday", "Celebration"],
    featured: false,
  },
  {
    id: "8",
    slug: "events-corporate",
    title: "Corporate Events",
    description: "Professional corporate gatherings",
    fullDescription:
      "Corporate events and professional gatherings documented with attention to detail.",
    tags: ["Corporate", "Events", "Professional"],
    featured: false,
  },
  {
    id: "9",
    slug: "events-wedding",
    title: "Wedding Events",
    description: "Wedding ceremonies and receptions",
    fullDescription:
      "Complete wedding documentation from ceremonies to receptions.",
    tags: ["Wedding", "Events", "Ceremony"],
    featured: false,
  },
  {
    id: "10",
    slug: "europe",
    title: "Europe",
    description: "European travel photography",
    fullDescription:
      "Photographs from travels across Europe, capturing culture, architecture, and landscapes.",
    tags: ["Travel", "Europe", "Culture"],
    featured: true,
  },
  {
    id: "11",
    slug: "events",
    title: "Events",
    description: "Various events and celebrations",
    fullDescription:
      "A collection of various events including parties, celebrations, and special occasions.",
    tags: ["Events", "Celebration", "Social"],
    featured: false,
  },
  {
    id: "12",
    slug: "architecture",
    title: "Architecture",
    description: "Architectural photography",
    fullDescription:
      "Beautiful architectural designs and structures captured with artistic vision.",
    tags: ["Architecture", "Design", "Urban"],
    featured: false,
  },
  {
    id: "13",
    slug: "nature",
    title: "Nature",
    description: "Natural landscapes and wildlife",
    fullDescription:
      "Photographs of natural beauty, from landscapes to wildlife in their natural habitats.",
    tags: ["Nature", "Landscape", "Wildlife"],
    featured: false,
  },
]
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
  {
    id: "7",
    slug: "europe",
    title: "Europe",
    description: "European adventures and city explorations",
    fullDescription:
      "Capturing the essence of European cities, architecture, and culture through the lens of travel and discovery.",
    tags: ["Travel", "Architecture", "Culture"],
    featured: true,
  },
  {
    id: "8",
    slug: "events",
    title: "Events",
    description: "Special moments and celebrations",
    fullDescription:
      "Documenting life's special moments, from weddings to corporate events, capturing emotions and memories that last forever.",
    tags: ["Events", "Celebration", "Portrait"],
    featured: false,
  },
  {
    id: "9",
    slug: "portraits-nj-moments",
    title: "NJ Moments",
    description: "New Jersey memories and portraits",
    fullDescription:
      "Capturing the spirit of New Jersey through intimate portraits and special moments.",
    tags: ["Portrait", "Local", "Personal"],
    featured: false,
  },
  {
    id: "10",
    slug: "commercial-jewelry",
    title: "Jewelry Photography",
    description: "Commercial jewelry and product photography",
    fullDescription:
      "Professional product photography showcasing jewelry pieces with meticulous attention to detail, lighting, and composition.",
    tags: ["Commercial", "Product", "Jewelry"],
    featured: false,
  },
  {
    id: "11",
    slug: "landscapes-dallas",
    title: "Dallas Landscapes",
    description: "Urban and natural landscapes of Dallas",
    fullDescription:
      "Exploring the diverse landscapes of Dallas, from urban skylines to natural beauty.",
    tags: ["Landscape", "Urban", "Dallas"],
    featured: false,
  },
  {
    id: "12",
    slug: "portraits-metuchen",
    title: "Metuchen Portraits",
    description: "Portraits from Metuchen, NJ",
    fullDescription:
      "Community portraits capturing the character and spirit of Metuchen, New Jersey.",
    tags: ["Portrait", "Community", "Local"],
    featured: false,
  },
  {
    id: "13",
    slug: "random",
    title: "Random Shots",
    description: "Miscellaneous and experimental photography",
    fullDescription:
      "A collection of random shots, experiments, and spontaneous captures that don't fit neatly into other categories.",
    tags: ["Experimental", "Random", "Creative"],
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
