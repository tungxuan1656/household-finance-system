import { describe, expect, it } from 'vitest'

import { AppError } from '@/lib/errors'
import { verifyTelegramLaunchData } from '@/lib/auth/telegram'

const encoder = new TextEncoder()

const toHex = (bytes: ArrayBuffer | Uint8Array): string => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)

  return Array.from(view)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const hmacSha256 = async (
  key: ArrayBuffer | Uint8Array | string,
  data: string,
) => {
  const keyBytes = typeof key === 'string' ? encoder.encode(key) : key

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data))
}

const signInitData = async (
  botToken: string,
  fields: Record<string, string>,
) => {
  const entries = Object.entries(fields).sort(([a], [b]) => a.localeCompare(b))
  const dataCheckString = entries
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  const secret = await hmacSha256('WebAppData', botToken)
  const hash = toHex(await hmacSha256(secret, dataCheckString))
  const params = new URLSearchParams({ ...fields, hash })

  return params.toString()
}

const baseOptions = {
  botToken: 'test-telegram-bot-token',
  freshnessWindowSeconds: 3600,
  nowEpochSeconds: 1_700_000_000,
}

describe('verifyTelegramLaunchData', () => {
  it('accepts a freshly signed initData', async () => {
    const initData = await signInitData(baseOptions.botToken, {
      auth_date: String(baseOptions.nowEpochSeconds - 60),
      user: JSON.stringify({
        id: 100200300,
        first_name: 'Tung',
        last_name: 'Doan',
        username: 'tungdoan',
        photo_url: 'https://t.me/i/avatar.png',
      }),
    })

    const identity = await verifyTelegramLaunchData(initData, baseOptions)

    expect(identity.subject).toBe('100200300')
    expect(identity.firstName).toBe('Tung')
    expect(identity.lastName).toBe('Doan')
    expect(identity.username).toBe('tungdoan')
    expect(identity.photoUrl).toBe('https://t.me/i/avatar.png')
    expect(identity.authDate).toBe(baseOptions.nowEpochSeconds - 60)
  })

  it('rejects when the auth_date is older than the freshness window', async () => {
    const initData = await signInitData(baseOptions.botToken, {
      auth_date: String(
        baseOptions.nowEpochSeconds - baseOptions.freshnessWindowSeconds - 1,
      ),
      user: JSON.stringify({ id: 1, first_name: 'Lag' }),
    })

    try {
      await verifyTelegramLaunchData(initData, baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('UNAUTHENTICATED')
    }
  })

  it('rejects when the hash does not match the data-check string', async () => {
    const initData = await signInitData(baseOptions.botToken, {
      auth_date: String(baseOptions.nowEpochSeconds - 30),
      user: JSON.stringify({ id: 1, first_name: 'Original' }),
    })

    const tamperedParams = new URLSearchParams(initData)
    tamperedParams.set(
      'user',
      JSON.stringify({ id: 1, first_name: 'Tampered' }),
    )

    try {
      await verifyTelegramLaunchData(tamperedParams.toString(), baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('UNAUTHENTICATED')
    }
  })

  it('rejects when the bot token does not match the signing key', async () => {
    const initData = await signInitData('another-bot-token', {
      auth_date: String(baseOptions.nowEpochSeconds - 30),
      user: JSON.stringify({ id: 1, first_name: 'Mismatch' }),
    })

    try {
      await verifyTelegramLaunchData(initData, baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('UNAUTHENTICATED')
    }
  })

  it('rejects when the hash field is missing', async () => {
    const params = new URLSearchParams({
      auth_date: String(baseOptions.nowEpochSeconds - 30),
      user: JSON.stringify({ id: 1, first_name: 'NoHash' }),
    })

    try {
      await verifyTelegramLaunchData(params.toString(), baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('INVALID_INPUT')
    }
  })

  it('rejects when the user field is missing', async () => {
    const initData = await signInitData(baseOptions.botToken, {
      auth_date: String(baseOptions.nowEpochSeconds - 30),
    })

    try {
      await verifyTelegramLaunchData(initData, baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('INVALID_INPUT')
    }
  })

  it('rejects when the user JSON is not parseable', async () => {
    const initData = await signInitData(baseOptions.botToken, {
      auth_date: String(baseOptions.nowEpochSeconds - 30),
      user: '{not-json',
    })

    try {
      await verifyTelegramLaunchData(initData, baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('INVALID_INPUT')
    }
  })

  it('rejects when the user id is missing', async () => {
    const initData = await signInitData(baseOptions.botToken, {
      auth_date: String(baseOptions.nowEpochSeconds - 30),
      user: JSON.stringify({ first_name: 'NoId' }),
    })

    try {
      await verifyTelegramLaunchData(initData, baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('INVALID_INPUT')
    }
  })

  it('rejects when initData is empty', async () => {
    try {
      await verifyTelegramLaunchData('', baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('INVALID_INPUT')
    }
  })

  it('treats equal-length mismatched hashes as invalid (constant-time compare)', async () => {
    const initData = await signInitData(baseOptions.botToken, {
      auth_date: String(baseOptions.nowEpochSeconds - 30),
      user: JSON.stringify({ id: 1, first_name: 'Constant' }),
    })

    const params = new URLSearchParams(initData)
    const originalHash = params.get('hash') ?? ''
    const tampered = originalHash
      .split('')
      .map((char) => (char === '0' ? '1' : '0'))
      .join('')
    params.set('hash', tampered)

    try {
      await verifyTelegramLaunchData(params.toString(), baseOptions)
      throw new Error('expected verifyTelegramLaunchData to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('UNAUTHENTICATED')
    }
  })
})
