import { describe, expect, it, vi } from 'vitest'

import {
  createAuthStorage,
  type SecureStorageLike,
} from '@/lib/storage/adapter'
import { STORAGE_KEYS } from '@/lib/storage/keys'

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
  it('persists refresh token to SecureStorage when supported', async () => {
    const secure = createFakeSecureStorage()
    const storage = createAuthStorage({ secureStorage: secure })

    expect(storage.isPersistent()).toBe(true)

    await storage.setRefreshToken('refresh-1')
    expect(secure.store.get(STORAGE_KEYS.refreshToken)).toBe('refresh-1')

    const value = await storage.getRefreshToken()
    expect(value).toBe('refresh-1')

    await storage.clearRefreshToken()
    expect(secure.store.get(STORAGE_KEYS.refreshToken)).toBeUndefined()
    expect(await storage.getRefreshToken()).toBeNull()
  })

  it('falls back to memory when SecureStorage is unsupported', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({
      secureStorage: createFakeSecureStorage({ supported: false }),
      warn,
    })

    expect(storage.isPersistent()).toBe(false)

    await storage.setRefreshToken('memory-1')
    expect(warn).toHaveBeenCalledTimes(1)

    const value = await storage.getRefreshToken()
    expect(value).toBe('memory-1')

    await storage.clearRefreshToken()
    expect(await storage.getRefreshToken()).toBeNull()
  })

  it('falls back to memory when SecureStorage throws on write', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({
      secureStorage: createFakeSecureStorage({ failOn: 'set' }),
      warn,
    })

    await storage.setRefreshToken('corrupt-1')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(await storage.getRefreshToken()).toBe('corrupt-1')
  })

  it('falls back to memory when SecureStorage hangs on write', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({
      secureStorage: createFakeSecureStorage({ hangOn: 'set' }),
      timeoutMs: 5,
      warn,
    })

    await storage.setRefreshToken('hang-1')

    expect(warn).toHaveBeenCalledTimes(1)
    expect(await storage.getRefreshToken()).toBe('hang-1')
  })

  it('does not warn on subsequent memory fallback writes', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({
      secureStorage: createFakeSecureStorage({ supported: false }),
      warn,
    })

    await storage.setRefreshToken('a')
    await storage.setRefreshToken('b')
    await storage.setRefreshToken('c')
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('falls back to memory when SecureStorage is missing entirely', async () => {
    const warn = vi.fn()
    const storage = createAuthStorage({ warn })

    expect(storage.isPersistent()).toBe(false)

    await storage.setRefreshToken('no-storage')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(await storage.getRefreshToken()).toBe('no-storage')
  })

  it('recovers from a corrupt secure read and returns null', async () => {
    const warn = vi.fn()
    const secure = createFakeSecureStorage({ failOn: 'get' })
    const storage = createAuthStorage({ secureStorage: secure, warn })

    expect(await storage.getRefreshToken()).toBeNull()
    expect(storage.isPersistent()).toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('falls back to memory when SecureStorage fails on delete', async () => {
    const warn = vi.fn()
    const secure = createFakeSecureStorage({ failOn: 'delete' })
    const storage = createAuthStorage({ secureStorage: secure, warn })

    await storage.setRefreshToken('refresh-1')
    await storage.clearRefreshToken()

    expect(storage.isPersistent()).toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(await storage.getRefreshToken()).toBeNull()
  })
})
