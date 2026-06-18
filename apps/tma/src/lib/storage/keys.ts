export const STORAGE_KEYS = {
  session: 'session:tma-auth',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
