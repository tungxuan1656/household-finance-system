import type { AuthApiClient } from './api'

export interface AuthSessionTokens {
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
}

export const refreshAccessToken = async (
  client: AuthApiClient,
  refreshToken: string,
): Promise<AuthSessionTokens> => {
  const result = await client.refreshSession(refreshToken)

  return {
    accessToken: result.accessToken,
    accessTokenExpiresIn: result.accessTokenExpiresIn,
    refreshToken: result.refreshToken,
    refreshTokenExpiresIn: result.refreshTokenExpiresIn,
  }
}
