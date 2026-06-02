import type { ExchangeProviderResponse } from '@/contracts'
import { createRefreshSession } from '@/db/repositories/session-repository'
import type { StoredUser } from '@/db/repositories/user-repository'
import { issueAccessToken, issueRefreshToken } from '@/lib/auth/jwt'
import { hashRefreshToken } from '@/lib/auth/security'
import { readConfig } from '@/lib/env'
import type { AppBindings, ExchangeProvider } from '@/types'
import { newId } from '@/utils/id'

export interface IssueAppSessionInput {
  user: StoredUser
  userAgent: string | null
  ipAddress: string | null
  provider: ExchangeProvider
}

export const issueAppSession = async (
  env: AppBindings['Bindings'],
  input: IssueAppSessionInput,
): Promise<ExchangeProviderResponse> => {
  const config = readConfig(env)
  const sessionId = newId()
  const accessToken = await issueAccessToken(config, input.user.id, sessionId)
  const refreshToken = await issueRefreshToken(config, input.user.id, sessionId)
  const tokenHash = await hashRefreshToken(
    refreshToken,
    config.refreshTokenPepper,
  )

  await createRefreshSession(env.DB, {
    sessionId,
    userId: input.user.id,
    tokenHash,
    expiresAt: Date.now() + config.refreshTokenTtlSeconds * 1000,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  })

  return {
    tokenType: 'Bearer',
    accessToken,
    accessTokenExpiresIn: config.accessTokenTtlSeconds,
    refreshToken,
    refreshTokenExpiresIn: config.refreshTokenTtlSeconds,
    user: {
      id: input.user.id,
      email: input.user.primaryEmail,
      displayName: input.user.displayName,
      avatarUrl: input.user.avatarUrl,
      provider: input.provider,
    },
  }
}
