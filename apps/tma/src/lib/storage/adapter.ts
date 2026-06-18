import type { AuthenticatedUser } from '@/lib/auth/api'

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

/**
 * Full session blob persisted in SecureStorage.
 *
 * Security note: this overrides the locked default "access token memory-only"
 * (docs/references/frontend/tma/state-and-storage-pattern.md:43 permits an
 * explicit security-review override). The access token is persisted in
 * encrypted device storage (Telegram SecureStorage, Mini Apps v9.0+) — never
 * in localStorage or DeviceStorage. Revocation is detected when the access
 * token expires or a 401 is received, not instantly on cold open.
 *
 * `telegramUserId` is a cache-invalidation key (Telegram account id), NOT an
 * authenticated identity. It prevents cross-user session reuse on shared
 * devices. The server remains the source of truth for identity via JWT
 * signature verification and refresh-token ownership.
 */
export interface StoredSession {
  telegramUserId: number
  user: AuthenticatedUser
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: number
  refreshTokenExpiresAt: number
}

export interface AuthStorage {
  getSession: () => Promise<StoredSession | null>
  setSession: (session: StoredSession) => Promise<void>
  clearSession: () => Promise<void>
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

/**
 * Probes isSupported across multiple SDK shapes (legacy per-method, pre-v9,
 * v9+ top-level). Defaults to true optimistically — failures surface via
 * read/write timeouts instead of a false negative during boot.
 */
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

const parseSession = (raw: string): StoredSession | null => {
  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
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

  const getSession = async (): Promise<StoredSession | null> => {
    const hadSecureStorage = storageRef !== null
    const secure = await readSecure(storageRef, STORAGE_KEYS.session, timeoutMs)

    if (secure === undefined && hadSecureStorage) {
      noteFallback()
    }

    if (secure != null) {
      return parseSession(secure)
    }

    const memory = memoryStore.get(STORAGE_KEYS.session)

    return memory ? parseSession(memory) : null
  }

  const setSession = async (session: StoredSession): Promise<void> => {
    const json = JSON.stringify(session)
    const ok = await writeSecure(
      storageRef,
      STORAGE_KEYS.session,
      json,
      timeoutMs,
    )

    if (!ok) {
      noteFallback()
    }

    memoryStore.set(STORAGE_KEYS.session, json)
  }

  const clearSession = async (): Promise<void> => {
    memoryStore.delete(STORAGE_KEYS.session)

    const ok = await deleteSecure(storageRef, STORAGE_KEYS.session, timeoutMs)

    if (!ok && storageRef !== null) {
      noteFallback()
    }
  }

  return {
    getSession,
    setSession,
    clearSession,
    isPersistent: () => persistent,
  }
}
