import type { JWTPayload } from 'jose'
import { z } from 'zod'

export const exchangeProviderRequestSchema = z
  .object({
    provider: z.literal('firebase'),
    idToken: z.string().min(1),
  })
  .strict()

export type ExchangeProviderRequest = z.infer<
  typeof exchangeProviderRequestSchema
>

export const refreshSessionRequestSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict()

export type RefreshSessionRequest = z.infer<typeof refreshSessionRequestSchema>

export interface AuthenticatedUserProfile {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  provider: 'firebase'
}

export interface ExchangeProviderTokenInput {
  provider: 'firebase'
  idToken: string
  userAgent: string | null
  ipAddress: string | null
}

export interface ExchangeProviderTokenOutput {
  tokenType: 'Bearer'
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
  user: AuthenticatedUserProfile
}

export interface RefreshSessionInput {
  refreshToken: string
  userAgent: string | null
  ipAddress: string | null
}

export interface RefreshSessionOutput {
  tokenType: 'Bearer'
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
}

export type SessionTokenKind = 'access' | 'refresh'

export interface SessionTokenPayload extends JWTPayload {
  sub: string
  sid: string
  typ: SessionTokenKind
}
