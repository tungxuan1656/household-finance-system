import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { queryClient } from '@/lib/query/query-client'
import { AppThemeProvider } from '@/lib/telegram/theme-provider'

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <AppThemeProvider>{children}</AppThemeProvider>
  </QueryClientProvider>
)
