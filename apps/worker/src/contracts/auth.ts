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

export interface AuthenticatedUserDTO {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  provider: 'firebase'
}

export interface ExchangeProviderResponse {
  tokenType: 'Bearer'
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
  user: AuthenticatedUserDTO
}

export interface RefreshSessionResponse {
  tokenType: 'Bearer'
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
}

export interface LogoutSessionResponse {
  revoked: true
}
