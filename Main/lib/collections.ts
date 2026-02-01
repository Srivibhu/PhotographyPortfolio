import type { Collection } from "./types"
import { fetchCloudinaryPhotos, getCloudinaryFolder } from "./cloudinary"

const collectionConfigs = [
  {
    id: "1",
    slug: "portraits-graduation",
    title: "Graduation Portraits",
    description: "Graduation moments and proud celebrations",
    fullDescription:
      "Capstone ceremonies, quiet reflections, and the rush of academic milestones—this series documents the textures, expressions, and light that defined the Class of 2024.",
    tags: ["Portrait", "Graduation", "Studio"],
    featured: true,
  },
  {
    id: "2",
    slug: "landscapes-nature",
    title: "Nature Landscapes",
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
    slug: "portraits-beach",
    title: "Beach Portraits",
    description: "Shorelines, dunes, and salt air",
    fullDescription:
      "Ocean mornings and low-sun glow. This collection borrows pastel walls of fog and the play between sand and surf.",
    tags: ["Beach", "Light", "Seascape"],
    featured: false,
  },
  {
    id: "5",
    slug: "portraits-family",
    title: "Family Portraits",
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
    if (slug === 'events') {
      // Special handling for events - merge multiple folders
      const eventFolders = ['mata24 event', 'nats event', 'svm-events', 'new-year-23']
      const allPhotos = await Promise.all(
        eventFolders.map(folder => fetchCloudinaryPhotos(folder))
      )
      photos = allPhotos.flat()
      // Sort by creation date, most recent first
      photos.sort((a, b) => new Date(b.metadata.takenAt || '').getTime() - new Date(a.metadata.takenAt || '').getTime())
    } else {
      const folder = getCloudinaryFolder(slug)
      photos = await fetchCloudinaryPhotos(folder)
    }
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
        if (collection.slug === 'events') {
          // Special handling for events - merge multiple folders
          const eventFolders = ['mata24 event', 'nats event', 'svm-events', 'new-year-23']
          const allPhotos = await Promise.all(
            eventFolders.map(folder => fetchCloudinaryPhotos(folder, 1))
          )
          const firstPhoto = allPhotos.flat()[0]
          coverImage = firstPhoto?.src || ""
        } else {
          const folder = getCloudinaryFolder(collection.slug)
          const photos = await fetchCloudinaryPhotos(folder, 1)
          coverImage = photos[0]?.src || ""
        }
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
