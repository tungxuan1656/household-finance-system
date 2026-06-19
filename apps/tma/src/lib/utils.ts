import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

type CryptoLike = {
  randomUUID?: () => string
  getRandomValues?: <T extends ArrayBufferView>(array: T) => T
}

const formatV4 = (bytes: Uint8Array): string => {
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))

  return (
    `${hex.slice(0, 4).join('')}-` +
    `${hex.slice(4, 6).join('')}-` +
    `${hex.slice(6, 8).join('')}-` +
    `${hex.slice(8, 10).join('')}-` +
    `${hex.slice(10, 16).join('')}`
  )
}

// Some Telegram iOS WebViews ship without `crypto.randomUUID`.
// Fall back to `getRandomValues` (v4 format), then to a non-crypto
// timestamp + Math.random id for ancient runtimes. IDs are used only
// for in-memory draft keys; uniqueness within a session is enough.
export const generateId = (): string => {
  const cryptoRef = (globalThis as { crypto?: CryptoLike }).crypto

  if (cryptoRef?.randomUUID) {
    return cryptoRef.randomUUID()
  }

  if (cryptoRef?.getRandomValues) {
    const bytes = new Uint8Array(16)
    cryptoRef.getRandomValues(bytes)

    return formatV4(bytes)
  }

  const time = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 12)

  return `${time}-${rand}`
}
