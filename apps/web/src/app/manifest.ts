import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#ffffff',
    description: 'Personal and family expense management system',
    display: 'standalone',
    icons: [
      {
        sizes: '64x64',
        src: '/pwa-64x64.png',
        type: 'image/png',
      },
      {
        sizes: '192x192',
        src: '/pwa-192x192.png',
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: '/pwa-512x512.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: '/maskable-icon-512x512.png',
        type: 'image/png',
      },
    ],
    categories: ['finance', 'productivity'],
    name: 'Household Finance',
    orientation: 'portrait',
    short_name: 'Household Finance',
    shortcuts: [
      {
        name: 'Add Expense',
        url: '/expenses?add-expense=1',
      },
      {
        name: 'Overview',
        url: '/home',
      },
    ],
    start_url: '/',
    theme_color: '#0a0a0a',
  }
}
