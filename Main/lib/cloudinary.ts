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

export function getCloudinaryFolder(slug: string): FolderQuery {
  // Map slugs to actual Cloudinary folder names
  const folderMapping: Record<string, string | string[]> = {
    "portraits-beach": "Portraits - Beach",
    "portraits-family": "Portraits - Family",
    "portraits-graduation": "Portraits - Graduation",
    "portraits-nj-moments": "Portraits - NJ Moments",
    "portraits-metuchen": "Portraits - Metuchen",
    "landscapes-dallas": "Landscapes - Dallas",
    "landscapes-nature": "Landscapes - Nature",
    "commercial-jewelry": "Commercial - Jewelry",
    "events": ["mata24 event", "nats event", "svm-events", "new-year-23"],
    "nyc": "nyc",
    "europe": "Europe",
    "trails": "trails",
    "random": "random",
    "author": "Author",
  }

  const actualFolder = folderMapping[slug] || slug
  if (Array.isArray(actualFolder)) {
    return actualFolder.map((folder) => `${CLOUDINARY_BASE_FOLDER}/${folder}`)
  }
  return `${CLOUDINARY_BASE_FOLDER}/${actualFolder}`
}
