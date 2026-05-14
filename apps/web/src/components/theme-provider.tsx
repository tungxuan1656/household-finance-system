'use client'

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes'
import * as React from 'react'

import { isEditableTarget } from '@/utils/dom/is-editable-target'

function ThemeShortcutListener() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() !== 'd') {
        return
      }

      const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
      setTheme(nextTheme)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      disableTransitionOnChange
      enableSystem
      attribute='class'
      defaultTheme='system'
      {...props}>
      <ThemeShortcutListener />
      {children}
    </NextThemesProvider>
  )
}

export { useTheme }
