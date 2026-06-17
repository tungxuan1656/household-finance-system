import { retrieveRawInitData } from '@tma.js/sdk'

export const readRawInitData = (): string | null => {
  try {
    const raw = retrieveRawInitData()
    if (typeof raw === 'string' && raw.length > 0) {
      return raw
    }
  } catch {
    // not in TMA environment
  }

  return null
}
