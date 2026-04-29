import '@/index.css'

import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { AppProviders } from '@/app/providers/app-providers'

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
  userScalable: false,
  width: 'device-width',
}

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Household Finance',
  },
  description: 'Personal and family expense management system',
  formatDetection: {
    telephone: false,
  },
  title: {
    default: 'Household Finance',
    template: '%s | Household Finance',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang='vi'>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
