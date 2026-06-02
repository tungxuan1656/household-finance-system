import { env } from 'cloudflare:test'

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
): Promise<ArrayBuffer> => {
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

export interface BuildTelegramInitDataOptions {
  authDate?: number
  user?: {
    id: number | string
    first_name?: string
    last_name?: string
    username?: string
    photo_url?: string
    language_code?: string
  }
  extraFields?: Record<string, string>
  botToken?: string
}

export const buildTelegramInitData = async ({
  authDate = Math.floor(Date.now() / 1000) - 60,
  user = {
    id: 555_000_111,
    first_name: 'Tung',
    last_name: 'Doan',
    username: 'tungdoan',
  },
  extraFields = {},
  botToken = (env as unknown as Record<string, string>).TELEGRAM_BOT_TOKEN ??
    'test-telegram-bot-token',
}: BuildTelegramInitDataOptions = {}): Promise<string> => {
  const fields: Record<string, string> = {
    auth_date: String(authDate),
    user: JSON.stringify(user),
    ...extraFields,
  }

  const entries = Object.entries(fields).sort(([a], [b]) => a.localeCompare(b))
  const dataCheckString = entries
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  const secret = await hmacSha256('WebAppData', botToken)
  const hash = toHex(await hmacSha256(secret, dataCheckString))

  const params = new URLSearchParams({ ...fields, hash })

  return params.toString()
}
