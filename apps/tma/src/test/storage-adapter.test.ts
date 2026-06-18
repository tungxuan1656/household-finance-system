import { describe, expect, it, vi } from 'vitest'

import {
  createAuthStorage,
  type SecureStorageLike,
  type StoredSession,
} from '@/lib/storage/adapter'
import { STORAGE_KEYS } from '@/lib/storage/keys'

const buildStoredSession = (
  overrides: Partial<StoredSession> = {},
): StoredSession => ({
  telegramUserId: 111,
  user: {
    id: 'user-1',
    email: null,
    displayName: 'Tung',
    avatarUrl: null,
    provider: 'telegram',
  },
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  accessTokenExpiresAt: Date.now() + 3600_000,
  refreshTokenExpiresAt: Date.now() + 86400_000,
  ...overrides,
})

const createFakeSecureStorage = (
  options: {
    supported?: boolean
    failOn?: 'get' | 'set' | 'delete'
    hangOn?: 'get' | 'set' | 'delete'
  } = {},
): SecureStorageLike & {
  store: Map<string, string>
  set: (key: string, value: string | null) => Promise<void>
  isSupported: () => boolean
} => {
  const store = new Map<string, string>()
  const isSupported = options.supported ?? true
  const failOn = options.failOn
  const hangOn = options.hangOn

  const hangForever = async () => new Promise<never>(() => undefined)

  const set = async (key: string, value: string | null) => {
    if (hangOn === 'set') {
      await hangForever()
    }
    if (failOn === 'set') {
      throw new Error('secure storage unavailable')
    }
    if (value === null) {
      store.delete(key)

      return
    }
    store.set(key, value)
  }

  return {
    store,
    set,
    getItem: async (key: string) => {
      if (hangOn === 'get') {
        await hangForever()
      }
      if (failOn === 'get') {
        throw new Error('secure storage unavailable')
      }

      return {
        value: store.get(key) ?? null,
        canRestore: false,
      }
    },
    setItem: (key, value) => set(key, value),
    deleteItem: async (key: string) => {
      if (hangOn === 'delete') {
        await hangForever()
      }
      if (failOn === 'delete') {
        throw new Error('secure storage unavailable')
      }
      store.delete(key)
    },
    clear: async () => {
      store.clear()
    },
    isSupported: () => isSupported,
  }
}

describe('auth storage adapter', () => {
  it('persists session blob to SecureStorage when supported', async () => {
    const secure = createFakeSecureStorage()
    const storage = createAuthStorage({ secureStorage: secure })

    expect(storage.isPersistent()).toBe(true)

    const session = buildStoredSession({ refreshToken: 'refresh-1' })
    await storage.setSession(session)

    const raw = secure.store.get(STORAGE_KEYS.session)
    expect(raw).toBeDefined()
    expect(JSON.parse(raw as string).refreshToken).toBe('refresh-1')

    const restored = await storage.getSession()
    expect(restored).not.toBeNull()
    expect(restored?.refreshToken).toBe('refresh-1')
    expect(restored?.accessToken).toBe('access-1')
    expect(restored?.telegramUserId).toBe(111)

    await storage.clearSession()
    expect(secure.store.get(STORAGE_KEYS.session)).toBeUndefined()
    expect(await storage.getSession()).toBeNull()
  })

  it('falls back to memory when SecureStorage is unsupported', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({
      secureStorage: createFakeSecureStorage({ supported: false }),
      warn,
    })

    expect(storage.isPersistent()).toBe(false)

    const session = buildStoredSession({ refreshToken: 'memory-1' })
    await storage.setSession(session)
    expect(warn).toHaveBeenCalledTimes(1)

    const restored = await storage.getSession()
    expect(restored?.refreshToken).toBe('memory-1')

    await storage.clearSession()
    expect(await storage.getSession()).toBeNull()
  })

  it('falls back to memory when SecureStorage throws on write', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({
      secureStorage: createFakeSecureStorage({ failOn: 'set' }),
      warn,
    })

    const session = buildStoredSession({ refreshToken: 'corrupt-1' })
    await storage.setSession(session)
    expect(warn).toHaveBeenCalledTimes(1)
    expect((await storage.getSession())?.refreshToken).toBe('corrupt-1')
  })

  it('falls back to memory when SecureStorage hangs on write', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({
      secureStorage: createFakeSecureStorage({ hangOn: 'set' }),
      timeoutMs: 5,
      warn,
    })

    const session = buildStoredSession({ refreshToken: 'hang-1' })
    await storage.setSession(session)

    expect(warn).toHaveBeenCalledTimes(1)
    expect((await storage.getSession())?.refreshToken).toBe('hang-1')
  })

  it('does not warn on subsequent memory fallback writes', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({
      secureStorage: createFakeSecureStorage({ supported: false }),
      warn,
    })

    await storage.setSession(buildStoredSession({ accessToken: 'a' }))
    await storage.setSession(buildStoredSession({ accessToken: 'b' }))
    await storage.setSession(buildStoredSession({ accessToken: 'c' }))
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('falls back to memory when SecureStorage is missing entirely', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({ warn })

    expect(storage.isPersistent()).toBe(false)

    const session = buildStoredSession({ refreshToken: 'no-storage' })
    await storage.setSession(session)
    expect(warn).toHaveBeenCalledTimes(1)
    expect((await storage.getSession())?.refreshToken).toBe('no-storage')
  })

  it('recovers from a failed secure read and returns null', async () => {
    const warn = vi.fn()
    const secure = createFakeSecureStorage({ failOn: 'get' })
    const storage = createAuthStorage({ secureStorage: secure, warn })

    expect(await storage.getSession()).toBeNull()
    expect(storage.isPersistent()).toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('returns null when the stored blob is corrupt JSON', async () => {
    const secure = createFakeSecureStorage()
    // Inject corrupt JSON directly into the underlying store.
    secure.store.set(STORAGE_KEYS.session, '{not valid json')

    const storage = createAuthStorage({ secureStorage: secure })

    expect(await storage.getSession()).toBeNull()
  })

  it('falls back to memory when SecureStorage fails on delete', async () => {
    const warn = vi.fn()
    const secure = createFakeSecureStorage({ failOn: 'delete' })
    const storage = createAuthStorage({ secureStorage: secure, warn })

    await storage.setSession(buildStoredSession({ refreshToken: 'refresh-1' }))
    await storage.clearSession()

    expect(storage.isPersistent()).toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(await storage.getSession()).toBeNull()
  })
})
