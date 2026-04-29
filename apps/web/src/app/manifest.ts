import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#ffffff',
    description: 'Personal and family expense management system',
    display: 'standalone',
    icons: [
      {
        purpose: 'maskable',
        sizes: '1024x1024',
        src: '/icon.png',
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
        url: '/expenses/new',
      },
      {
        name: 'Overview',
        url: '/home',
      },
    ],
    start_url: '/',
    theme_color: '#ffffff',
  }
}
