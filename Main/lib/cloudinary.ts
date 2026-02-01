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
}

function assertCloudinaryConfig() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary environment variables.")
  }
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

export async function fetchCloudinaryPhotos(folder: string, maxResults: number = 120): Promise<Photo[]> {
  assertCloudinaryConfig()

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: buildAuthHeader(),
    },
    body: JSON.stringify({
      expression: `folder:${folder}`,
      max_results: maxResults,
      sort_by: [{ created_at: "desc" }],
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
    metadata: {
      camera: "",
      lens: "",
      aperture: "",
      shutterSpeed: "",
      iso: "",
      focalLength: "",
      takenAt: resource.created_at ? resource.created_at.split("T")[0] : "",
    },
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
    metadata: {
      camera: "",
      lens: "",
      aperture: "",
      shutterSpeed: "",
      iso: "",
      focalLength: "",
      takenAt: resource.created_at ? resource.created_at.split("T")[0] : "",
    },
  }))
}

export function getCloudinaryFolder(slug: string) {
  // Map slugs to actual Cloudinary folder names
  const folderMapping: Record<string, string> = {
    'portraits-beach': 'Portraits - Beach',
    'landscapes-dallas': 'Landscapes - Dallas',
    'portraits-family': 'Portraits - Family',
    'portraits-graduation': 'Portraits - Graduation',
    'portraits-nj-moments': 'Portraits - NJ Moments',
    'commercial-jewelry': 'Commercial - Jewelry',
    'landscapes-nature': 'Landscapes - Nature',
    'portraits-metuchen': 'Portraits - Metuchen',
    'nyc': 'nyc',
    'europe': 'Europe',
    'random': 'random',
    'trails': 'trails',
    'events': 'events', // This will be handled specially
    'mata24 event': 'mata24 event',
    'nats event': 'nats event',
    'svm-events': 'svm-events',
    'new-year-23': 'new-year-23'
  }

  const actualFolder = folderMapping[slug] || slug
  return `${CLOUDINARY_BASE_FOLDER}/${actualFolder}`
}
