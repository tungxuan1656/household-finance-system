import {
  createRefreshSession,
  findSessionByIdAndHash,
  isSessionActive,
  revokeSessionIfActive,
} from '@/db/repositories/session-repository'
import type {
  AppBindings,
  RefreshSessionInput,
  RefreshSessionOutput,
} from '@/dto'
import { readConfig } from '@/lib/env'
import { unauthenticated } from '@/lib/errors'
import {
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshToken,
} from '@/utils/auth/jwt'
import { hashRefreshToken } from '@/utils/auth/security'
import { newId } from '@/utils/shared/id'

export const refreshSession = async (
  env: AppBindings['Bindings'],
  input: RefreshSessionInput,
): Promise<RefreshSessionOutput> => {
  const config = readConfig(env)
  const refreshPayload = await verifyRefreshToken(input.refreshToken, config)
  const tokenHash = await hashRefreshToken(
    input.refreshToken,
    config.refreshTokenPepper,
  )

  const existingSession = await findSessionByIdAndHash(
    env.DB,
    refreshPayload.sid,
    tokenHash,
  )

  if (
    !existingSession ||
    !isSessionActive(existingSession) ||
    existingSession.userId !== refreshPayload.sub
  ) {
    throw unauthenticated('Refresh token is invalid, expired, or revoked.')
  }

  const isRevoked = await revokeSessionIfActive(env.DB, existingSession.id)

  if (!isRevoked) {
    throw unauthenticated('Refresh token is invalid, expired, or revoked.')
  }

  const rotatedSessionId = newId()
  const accessToken = await issueAccessToken(
    config,
    existingSession.userId,
    rotatedSessionId,
  )
  const refreshToken = await issueRefreshToken(
    config,
    existingSession.userId,
    rotatedSessionId,
  )
  const rotatedHash = await hashRefreshToken(
    refreshToken,
    config.refreshTokenPepper,
  )

  await createRefreshSession(env.DB, {
    sessionId: rotatedSessionId,
    userId: existingSession.userId,
    tokenHash: rotatedHash,
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
  }
}
