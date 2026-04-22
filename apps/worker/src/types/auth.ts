import type { JWTPayload } from 'jose'

import type { SupportedLocale } from '@/lib/i18n'

export interface ExchangeProviderTokenInput {
  provider: 'firebase'
  idToken: string
  locale: SupportedLocale
  userAgent: string | null
  ipAddress: string | null
}

export interface RefreshSessionInput {
  refreshToken: string
  locale: SupportedLocale
  userAgent: string | null
  ipAddress: string | null
}

export type SessionTokenKind = 'access' | 'refresh'

export interface SessionTokenPayload extends JWTPayload {
  sub: string
  sid: string
  typ: SessionTokenKind
}
