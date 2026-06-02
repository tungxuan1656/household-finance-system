import { z } from 'zod'

export const firebaseExchangeProviderRequestSchema = z
  .object({
    provider: z.literal('firebase'),
    idToken: z.string().min(1),
  })
  .strict()

export const telegramExchangeProviderRequestSchema = z
  .object({
    provider: z.literal('telegram'),
    initData: z.string().min(1),
  })
  .strict()

export const exchangeProviderRequestSchema = z.discriminatedUnion('provider', [
  firebaseExchangeProviderRequestSchema,
  telegramExchangeProviderRequestSchema,
])

export type ExchangeProviderRequest = z.infer<
  typeof exchangeProviderRequestSchema
>

export type FirebaseExchangeProviderRequest = z.infer<
  typeof firebaseExchangeProviderRequestSchema
>

export type TelegramExchangeProviderRequest = z.infer<
  typeof telegramExchangeProviderRequestSchema
>

export const refreshSessionRequestSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict()

export type RefreshSessionRequest = z.infer<typeof refreshSessionRequestSchema>

export type AuthProvider = 'firebase' | 'telegram'

export interface AuthenticatedUserDTO {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  provider: AuthProvider
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
