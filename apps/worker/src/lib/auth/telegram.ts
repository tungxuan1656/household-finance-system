import { invalidInput, unauthenticated } from '@/lib/errors'
import { defaultLocale, type SupportedLocale } from '@/lib/i18n'

export interface TelegramIdentity {
  subject: string
  authDate: number
  firstName: string | null
  lastName: string | null
  username: string | null
  photoUrl: string | null
}

const encoder = new TextEncoder()

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false
  }

  let diff = 0

  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return diff === 0
}

interface TelegramUserPayload {
  id?: unknown
  first_name?: unknown
  last_name?: unknown
  username?: unknown
  photo_url?: unknown
}

const isStringOrNull = (value: unknown): value is string | null =>
  value === null || typeof value === 'string'

const normalizeTelegramUser = (parsed: unknown): TelegramUserPayload => {
  if (typeof parsed !== 'object' || parsed === null) {
    return {}
  }

  return parsed as TelegramUserPayload
}

const parseLaunchData = (
  initData: string,
): {
  hash: string
  authDate: number
  user: TelegramUserPayload
} | null => {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  const authDateRaw = params.get('auth_date')
  const userRaw = params.get('user')

  if (!hash || !authDateRaw || !userRaw) {
    return null
  }

  const authDate = Number.parseInt(authDateRaw, 10)

  if (!Number.isFinite(authDate)) {
    return null
  }

  let userParsed: unknown

  try {
    userParsed = JSON.parse(userRaw) as unknown
  } catch {
    return null
  }

  const user = normalizeTelegramUser(userParsed)

  if (typeof user.id !== 'number' && typeof user.id !== 'string') {
    return null
  }

  const userId = user.id

  if (typeof userId === 'string' && userId.length === 0) {
    return null
  }

  return { hash, authDate, user }
}

const buildDataCheckString = (initData: string): string => {
  const params = new URLSearchParams(initData)
  params.delete('hash')

  const entries: string[] = []

  for (const key of new Set(params.keys()).values()) {
    const values = params.getAll(key)

    for (const value of values) {
      entries.push(`${key}=${value}`)
    }
  }

  entries.sort()

  return entries.join('\n')
}

const computeHmacSha256 = async (
  key: ArrayBuffer | Uint8Array | string,
  data: string,
): Promise<Uint8Array> => {
  const keyBytes = typeof key === 'string' ? encoder.encode(key) : key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(data),
  )

  return new Uint8Array(signature)
}

export interface VerifyTelegramLaunchDataOptions {
  botToken: string
  freshnessWindowSeconds: number
  nowEpochSeconds?: number
  locale?: SupportedLocale
}

export const verifyTelegramLaunchData = async (
  initData: string,
  options: VerifyTelegramLaunchDataOptions,
): Promise<TelegramIdentity> => {
  const locale = options.locale ?? defaultLocale
  const nowEpoch = options.nowEpochSeconds ?? Math.floor(Date.now() / 1000)

  if (typeof initData !== 'string' || initData.trim().length === 0) {
    throw invalidInput(locale, 'errors.invalidTelegramLaunchData')
  }

  const parsed = parseLaunchData(initData)

  if (!parsed) {
    throw invalidInput(locale, 'errors.invalidTelegramLaunchData')
  }

  if (nowEpoch - parsed.authDate > options.freshnessWindowSeconds) {
    throw unauthenticated(locale, 'errors.telegramLaunchDataExpired')
  }

  const dataCheckString = buildDataCheckString(initData)
  const secret = await computeHmacSha256('WebAppData', options.botToken)
  const expectedHashBytes = await computeHmacSha256(secret, dataCheckString)
  const expectedHash = toHex(expectedHashBytes)

  if (!constantTimeEqual(expectedHash, parsed.hash)) {
    throw unauthenticated(locale, 'errors.telegramLaunchDataInvalidSignature')
  }

  const { user } = parsed
  const subject = String(user.id)
  const firstName = isStringOrNull(user.first_name) ? user.first_name : null
  const lastName = isStringOrNull(user.last_name) ? user.last_name : null
  const username = isStringOrNull(user.username) ? user.username : null
  const photoUrl = isStringOrNull(user.photo_url) ? user.photo_url : null

  return {
    subject,
    authDate: parsed.authDate,
    firstName,
    lastName,
    username,
    photoUrl,
  }
}
