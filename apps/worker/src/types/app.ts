import type { SupportedLocale } from '@/lib/i18n'

export interface AuthUser {
  id: string
  email: string | null
  provider: 'firebase'
}

export type AppBindings = {
  Bindings: Env
  Variables: {
    requestId: string
    requestEpoch: number
    locale: SupportedLocale
    currentUser: AuthUser
    currentSessionId: string
  }
}

export interface AppConfig {
  authIssuer: string
  authAudience: string
  accessTokenTtlSeconds: number
  refreshTokenTtlSeconds: number
  authJwtSecret: string
  refreshTokenPepper: string
  firebaseProjectId: string
  firebaseJwksUrl: string
  allowInsecureTestTokens: boolean
  appEnvironment: string
  cloudinaryCloudName: string
  cloudinaryApiKey: string
  cloudinaryApiSecret: string
  cloudinaryMaxImageBytes: number
  cloudinaryMaxVideoBytes: number
  cloudinaryAllowedImageMimeTypes: string[]
  cloudinaryAllowedVideoMimeTypes: string[]
}
