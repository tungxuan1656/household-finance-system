import '@/index.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AppProviders } from '@/app/providers/app-providers'

export const metadata: Metadata = {
  description: 'Personal and family expense management system',
  title: 'Household Finance',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang='vi'>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
