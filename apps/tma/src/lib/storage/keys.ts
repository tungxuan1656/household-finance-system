export const STORAGE_KEYS = {
  refreshToken: 'session:refresh-token',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
