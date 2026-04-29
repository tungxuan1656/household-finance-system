import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#ffffff',
    description: 'Personal and family expense management system',
    display: 'standalone',
    icons: [
      {
        sizes: '192x192',
        src: '/icons/icon-192.png',
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: '/icons/icon-512.png',
        type: 'image/png',
      },
    ],
    name: 'Household Finance',
    short_name: 'Household Finance',
    start_url: '/',
    theme_color: '#ffffff',
  }
}
