import { AUTH_REFRESH_TOKEN_STORAGE_KEY } from '@/lib/constants/auth'

type TokenStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>

const readBrowserStorage = (): TokenStorage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export type AuthRefreshTokenStorage = {
  clear(): void
  read(): string | null
  write(refreshToken: string): void
}

export const createAuthRefreshTokenStorage = (
  storage: TokenStorage | null = readBrowserStorage(),
): AuthRefreshTokenStorage => ({
  clear: () => {
    try {
      storage?.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)
    } catch {
      // Best-effort cleanup in restricted browser storage contexts.
    }
  },
  read: () => {
    try {
      return storage?.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY) ?? null
    } catch {
      return null
    }
  },
  write: (refreshToken: string) => {
    try {
      storage?.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken)
    } catch {
      // Best-effort persistence in restricted browser storage contexts.
    }
  },
})

export const authRefreshTokenStorage = createAuthRefreshTokenStorage()
