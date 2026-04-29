'use client'

import '@/lib/i18n'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

import { SwRegister } from '@/app/providers/sw-register'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SwRegister />
        {children}
        <Toaster richColors position='top-right' />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
