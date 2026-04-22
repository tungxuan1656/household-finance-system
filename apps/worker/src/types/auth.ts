import type { JWTPayload } from 'jose'

export interface ExchangeProviderTokenInput {
  provider: 'firebase'
  idToken: string
  userAgent: string | null
  ipAddress: string | null
}

export interface RefreshSessionInput {
  refreshToken: string
  userAgent: string | null
  ipAddress: string | null
}

export type SessionTokenKind = 'access' | 'refresh'

export interface SessionTokenPayload extends JWTPayload {
  sub: string
  sid: string
  typ: SessionTokenKind
}
