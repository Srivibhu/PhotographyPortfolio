import { renderShareImage, ogImageSize } from "@/lib/og-image"

export const alt = "Srivibhu Ponakala Photography Portfolio"
export const size = ogImageSize
export const contentType = "image/png"
export const revalidate = 86400

export default async function Image() {
  return renderShareImage()
}
