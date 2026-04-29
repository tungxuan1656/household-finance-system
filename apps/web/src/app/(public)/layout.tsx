import type { ReactNode } from 'react'

import { PublicLayout } from '@/components/layouts/public-layout'
import { PublicRoute } from '@/components/layouts/public-route'

export default function PublicGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <PublicRoute>
      <PublicLayout>{children}</PublicLayout>
    </PublicRoute>
  )
}
