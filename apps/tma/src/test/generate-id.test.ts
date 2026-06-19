import { afterEach, describe, expect, it } from 'vitest'

import { generateId } from '@/lib/utils'

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u

const withCryptoShim = <T>(shim: unknown, run: () => T): T => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')

  Object.defineProperty(globalThis, 'crypto', {
    value: shim,
    configurable: true,
    writable: true,
  })

  try {
    return run()
  } finally {
    if (original) {
      Object.defineProperty(globalThis, 'crypto', original)
    } else {
      // @ts-expect-error cleanup: remove the test-only shim when no original existed
      delete globalThis.crypto
    }
  }
}

describe('generateId', () => {
  const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto')

  afterEach(() => {
    if (originalCrypto) {
      Object.defineProperty(globalThis, 'crypto', originalCrypto)
    } else {
      // @ts-expect-error cleanup: restore the pre-test crypto state
      delete globalThis.crypto
    }
  })

  it('uses crypto.randomUUID when available', () => {
    let calls = 0
    const shim = {
      randomUUID: () => {
        calls += 1

        return '00000000-0000-4000-8000-000000000000'
      },
    }

    withCryptoShim(shim, () => {
      const id = generateId()

      expect(id).toBe('00000000-0000-4000-8000-000000000000')
      expect(calls).toBe(1)
    })
  })

  it('falls back to getRandomValues with v4 format when randomUUID is missing', () => {
    const shim = {
      getRandomValues: <T extends ArrayBufferView>(array: T): T => {
        if (array instanceof Uint8Array) {
          for (let i = 0; i < array.length; i += 1) {
            array[i] = i
          }
        }

        return array
      },
    }

    withCryptoShim(shim, () => {
      const id = generateId()

      expect(id).toMatch(UUID_V4_REGEX)
      expect(id).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f')
    })
  })

  it('falls back to timestamp + Math.random when no crypto is available', () => {
    withCryptoShim(undefined, () => {
      const id = generateId()

      expect(id).toMatch(/^[0-9a-z]+-[0-9a-z]+$/u)
      expect(generateId()).not.toBe(id)
    })
  })

  it('returns unique ids across calls', () => {
    const ids = new Set<string>()

    for (let i = 0; i < 32; i += 1) {
      ids.add(generateId())
    }

    expect(ids.size).toBe(32)
  })
})
