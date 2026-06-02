import type { ReactNode } from 'react'

interface AppThemeProviderProps {
  children: ReactNode
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) =>
  children
