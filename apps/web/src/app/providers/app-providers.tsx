'use client'

import '@/lib/i18n/i18n-init'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

import { SwRegister } from '@/app/providers/sw-register'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>
          <SwRegister />
          {children}
          <Toaster richColors position='top-right' />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
