import { STORAGE_KEYS } from './keys'

export interface SecureStorageLike {
  getItem: (
    key: string,
  ) => Promise<{ value: string | null; canRestore: boolean }>
  setItem: (key: string, value: string | null) => Promise<void>
  deleteItem: (key: string) => Promise<void>
  clear: () => Promise<void>
}

interface WithIsSupported {
  isSupported?: () => boolean
}

export interface AuthStorage {
  getRefreshToken: () => Promise<string | null>
  setRefreshToken: (token: string) => Promise<void>
  clearRefreshToken: () => Promise<void>
  isPersistent: () => boolean
}

export interface CreateAuthStorageOptions {
  secureStorage?: SecureStorageLike | null
  timeoutMs?: number
  warn?: (message: string) => void
}

const DEFAULT_STORAGE_TIMEOUT_MS = 1500

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('secure storage timeout'))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }
}

const checkIsSupported = (
  storage: SecureStorageLike | null | undefined,
): boolean => {
  if (!storage) {
    return false
  }

  const candidate = storage as SecureStorageLike & WithIsSupported
  const getWithCheck = (storage as unknown as { getItem?: unknown })
    .getItem as ((...args: unknown[]) => unknown) & WithIsSupported
  const setWithCheck = (storage as unknown as { setItem?: unknown })
    .setItem as ((...args: unknown[]) => unknown) & WithIsSupported

  if (typeof candidate.isSupported === 'function') {
    return candidate.isSupported()
  }

  if (getWithCheck && typeof getWithCheck.isSupported === 'function') {
    return getWithCheck.isSupported()
  }

  if (setWithCheck && typeof setWithCheck.isSupported === 'function') {
    return setWithCheck.isSupported()
  }

  return true
}

const readSecure = async (
  storage: SecureStorageLike | null | undefined,
  key: string,
  timeoutMs: number,
): Promise<string | null | undefined> => {
  if (!checkIsSupported(storage)) {
    return undefined
  }

  try {
    const result = await withTimeout(storage!.getItem(key), timeoutMs)

    return result.value
  } catch {
    return undefined
  }
}

const writeSecure = async (
  storage: SecureStorageLike | null | undefined,
  key: string,
  value: string | null,
  timeoutMs: number,
): Promise<boolean> => {
  if (!checkIsSupported(storage)) {
    return false
  }

  try {
    await withTimeout(storage!.setItem(key, value), timeoutMs)

    return true
  } catch {
    return false
  }
}

const deleteSecure = async (
  storage: SecureStorageLike | null | undefined,
  key: string,
  timeoutMs: number,
): Promise<boolean> => {
  if (!checkIsSupported(storage)) {
    return false
  }

  try {
    await withTimeout(storage!.deleteItem(key), timeoutMs)

    return true
  } catch {
    return false
  }
}

export const createAuthStorage = (
  options: CreateAuthStorageOptions = {},
): AuthStorage => {
  const memoryStore = new Map<string, string>()
  const timeoutMs = options.timeoutMs ?? DEFAULT_STORAGE_TIMEOUT_MS
  const warn = options.warn ?? ((message: string) => console.warn(message))
  const initialStorage = options.secureStorage ?? null
  let storageRef: SecureStorageLike | null = initialStorage
  let persistent = checkIsSupported(storageRef)
  let warned = false

  const noteFallback = (): void => {
    if (warned) {
      return
    }
    warned = true
    persistent = false
    storageRef = null

    warn(
      '[tma] SecureStorage unsupported; session is memory-only and will re-exchange on next launch.',
    )
  }

  const getRefreshToken = async (): Promise<string | null> => {
    const secure = await readSecure(
      storageRef,
      STORAGE_KEYS.refreshToken,
      timeoutMs,
    )

    if (secure !== undefined && secure !== null) {
      return secure
    }

    return memoryStore.get(STORAGE_KEYS.refreshToken) ?? null
  }

  const setRefreshToken = async (token: string): Promise<void> => {
    const ok = await writeSecure(
      storageRef,
      STORAGE_KEYS.refreshToken,
      token,
      timeoutMs,
    )

    if (!ok) {
      noteFallback()
    }

    memoryStore.set(STORAGE_KEYS.refreshToken, token)
  }

  const clearRefreshToken = async (): Promise<void> => {
    memoryStore.delete(STORAGE_KEYS.refreshToken)
    await deleteSecure(storageRef, STORAGE_KEYS.refreshToken, timeoutMs)
  }

  return {
    getRefreshToken,
    setRefreshToken,
    clearRefreshToken,
    isPersistent: () => persistent,
  }
}
