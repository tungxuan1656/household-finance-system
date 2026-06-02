import type { JWTPayload } from 'jose'

import type { AuthProvider } from '@/contracts'
import type { SupportedLocale } from '@/lib/i18n'

export type FirebaseExchangeProviderTokenInput = {
  provider: 'firebase'
  idToken: string
  locale: SupportedLocale
  userAgent: string | null
  ipAddress: string | null
}

export type TelegramExchangeProviderTokenInput = {
  provider: 'telegram'
  initData: string
  locale: SupportedLocale
  userAgent: string | null
  ipAddress: string | null
}

export type ExchangeProviderTokenInput =
  | FirebaseExchangeProviderTokenInput
  | TelegramExchangeProviderTokenInput

export type ExchangeProvider = AuthProvider

export interface RefreshSessionInput {
  refreshToken: string
  locale: SupportedLocale
  userAgent: string | null
  ipAddress: string | null
}

export interface LogoutSessionInput {
  currentSessionId: string
  requestEpoch: number
  locale: SupportedLocale
}

export type SessionTokenKind = 'access' | 'refresh'

export interface SessionTokenPayload extends JWTPayload {
  sub: string
  sid: string
  typ: SessionTokenKind
}
