export interface AuthUser {
  id: string
  email: string | null
  provider: 'firebase'
}

export type AppBindings = {
  Bindings: Env
  Variables: {
    requestId: string
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
}
