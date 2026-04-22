import type { RefreshSessionResponse } from '@/contracts'
import {
  findSessionByIdAndHash,
  isSessionActive,
  rotateRefreshSession,
} from '@/db/repositories/session-repository'
import {
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshToken,
} from '@/lib/auth/jwt'
import { hashRefreshToken } from '@/lib/auth/security'
import { readConfig } from '@/lib/env'
import { unauthenticated } from '@/lib/errors'
import type { AppBindings, RefreshSessionInput } from '@/types'
import { newId } from '@/utils/id'

export const refreshSession = async (
  env: AppBindings['Bindings'],
  input: RefreshSessionInput,
): Promise<RefreshSessionResponse> => {
  const config = readConfig(env)
  const refreshPayload = await verifyRefreshToken(
    input.refreshToken,
    config,
    input.locale,
  )
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
    throw unauthenticated(input.locale, 'errors.refreshTokenInvalid')
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

  const rotated = await rotateRefreshSession(env.DB, {
    previousSessionId: existingSession.id,
    newSessionId: rotatedSessionId,
    userId: existingSession.userId,
    tokenHash: rotatedHash,
    expiresAt: Date.now() + config.refreshTokenTtlSeconds * 1000,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  })

  if (!rotated) {
    throw unauthenticated(input.locale, 'errors.refreshTokenInvalid')
  }

  return {
    tokenType: 'Bearer',
    accessToken,
    accessTokenExpiresIn: config.accessTokenTtlSeconds,
    refreshToken,
    refreshTokenExpiresIn: config.refreshTokenTtlSeconds,
  }
}
