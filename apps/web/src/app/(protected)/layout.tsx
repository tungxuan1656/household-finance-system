import type { ReactNode } from 'react'

import { MainLayout } from '@/components/layouts/main-layout'
import { ProtectedRoute } from '@/components/layouts/protected-route'

export default function ProtectedGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  )
}
