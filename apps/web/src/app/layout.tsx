import '@/index.css'

import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import { AppProviders } from '@/app/providers/app-providers'
import { cn } from '@/utils/cn'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
  userScalable: false,
  viewportFit: 'cover',
  width: 'device-width',
}

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Household Finance',
  },
  description: 'Personal and family expense management system',
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    apple: [
      {
        sizes: '180x180',
        url: '/apple-touch-icon-180x180.png',
      },
    ],
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        type: 'image/png',
        url: '/pwa-192x192.png',
        sizes: '192x192',
      },
    ],
  },
  keywords: [
    'expense tracker',
    'household finance',
    'family budget',
    'money management',
  ],
  manifest: '/manifest.webmanifest',
  openGraph: {
    description: 'Personal and family expense management system',
    images: [
      {
        alt: 'Household Finance',
        height: 1024,
        url: '/icon.png',
        width: 1024,
      },
    ],
    locale: 'vi_VN',
    siteName: 'Household Finance',
    title: 'Household Finance | Manage expenses easily',
    type: 'website',
    url: '/',
  },
  other: {
    HandheldFriendly: 'true',
    'mobile-web-app-capable': 'yes',
  },
  title: {
    default: 'Household Finance | Manage expenses easily',
    template: '%s | Household Finance',
  },
  twitter: {
    card: 'summary_large_image',
    description: 'Personal and family expense management system',
    images: ['/icon.png'],
    title: 'Household Finance | Manage expenses easily',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={cn(
        'h-full antialiased',
        'font-mono',
        jetbrainsMono.variable,
        'font-sans',
        inter.variable,
      )}
      lang='vi'>
      <body suppressHydrationWarning className='flex min-h-dvh flex-col'>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
