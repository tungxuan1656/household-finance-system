import type { SupportedLocale } from '@/lib/i18n'

export interface AuthUser {
  id: string
  email: string | null
  provider: 'firebase' | 'telegram'
}

export type HouseholdRole = 'admin' | 'member'

export interface ResolvedHouseholdMembership {
  householdId: string
  id: string
  role: HouseholdRole
  userId: string
}

export type AppBindings = {
  Bindings: Env
  Variables: {
    requestId: string
    requestEpoch: number
    locale: SupportedLocale
    currentUser: AuthUser
    currentSessionId: string
    requestHouseholdId?: string
    currentHouseholdId?: string
    currentHouseholdMembership?: ResolvedHouseholdMembership
    requestTargetUserId?: string
  }
}

export interface AppConfig {
  appEnvironment: string
  authIssuer: string
  authAudience: string
  accessTokenTtlSeconds: number
  refreshTokenTtlSeconds: number
  authJwtSecret: string
  refreshTokenPepper: string
  invitationTokenPepper: string
  firebaseProjectId: string
  firebaseJwksUrl: string
  allowInsecureTestTokens: boolean
  telegramBotToken: string
  telegramBotWebhookSecret: string
  telegramFreshnessWindowSeconds: number
  telegramBotTmaUrl: string
  telegramBotDeepLinkUrl: string
  internalApiKey: string | undefined
}

export interface CloudinaryConfig {
  appEnvironment: string
  cloudinaryCloudName: string
  cloudinaryApiKey: string
  cloudinaryApiSecret: string
  cloudinaryMaxImageBytes: number
  cloudinaryMaxVideoBytes: number
  cloudinaryAllowedImageMimeTypes: string[]
  cloudinaryAllowedVideoMimeTypes: string[]
}
