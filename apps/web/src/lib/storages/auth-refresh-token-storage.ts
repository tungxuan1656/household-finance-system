import { AUTH_REFRESH_TOKEN_STORAGE_KEY } from '@/lib/constants/auth'
import {
  readLocalStorageItem,
  removeLocalStorageItem,
  writeLocalStorageItem,
} from '@/lib/storages/browser-storage'

export type AuthRefreshTokenStorage = {
  clear(): void
  read(): string | null
  write(refreshToken: string): void
}

export const createAuthRefreshTokenStorage = (): AuthRefreshTokenStorage => ({
  clear: () => {
    try {
      removeLocalStorageItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)
    } catch {
      // Best-effort cleanup in restricted browser storage contexts.
    }
  },
  read: () => {
    try {
      return readLocalStorageItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  },
  write: (refreshToken: string) => {
    try {
      writeLocalStorageItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken)
    } catch {
      // Best-effort persistence in restricted browser storage contexts.
    }
  },
})

export const authRefreshTokenStorage = createAuthRefreshTokenStorage()
