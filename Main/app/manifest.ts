import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Srivibhu Ponakala Photography',
    short_name: 'Srivibhu Photo',
    description: 'Automotive, travel, and lifestyle photography by Srivibhu Ponakala.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
