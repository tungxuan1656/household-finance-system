import { viewport } from '@tma.js/sdk'

export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

const ZERO: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 }

export const getSafeAreaInsets = (): SafeAreaInsets => {
  if (!viewport.isMounted()) return ZERO

  const inset = viewport.safeAreaInsets()

  return inset ?? ZERO
}

export const getContentSafeAreaInsets = (): SafeAreaInsets => {
  if (!viewport.isMounted()) return ZERO

  const inset = viewport.contentSafeAreaInsets()

  return inset ?? ZERO
}
