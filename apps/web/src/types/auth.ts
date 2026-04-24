export type AuthProvider = 'firebase'

export type AuthenticatedUserDTO = {
  avatarUrl: string | null
  displayName: string | null
  email: string | null
  id: string
  provider: AuthProvider
}

export type ExchangeProviderRequest = {
  idToken: string
  provider: AuthProvider
}

export type ExchangeProviderResponse = {
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
  tokenType: 'Bearer'
  user: AuthenticatedUserDTO
}

export type LogoutSessionResponse = {
  revoked: true
}
