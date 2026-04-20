import { createRefreshSession } from '@/db/repositories/session-repository'
import { upsertUserByFirebaseIdentity } from '@/db/repositories/user-repository'
import type {
  AppBindings,
  ExchangeProviderTokenInput,
  ExchangeProviderTokenOutput,
} from '@/dto'
import { readConfig } from '@/lib/env'
import { verifyFirebaseIdToken } from '@/utils/auth/firebase'
import { issueAccessToken, issueRefreshToken } from '@/utils/auth/jwt'
import { hashRefreshToken } from '@/utils/auth/security'
import { newId } from '@/utils/shared/id'

export const exchangeProviderToken = async (
  env: AppBindings['Bindings'],
  input: ExchangeProviderTokenInput,
): Promise<ExchangeProviderTokenOutput> => {
  const config = readConfig(env)
  const firebaseIdentity = await verifyFirebaseIdToken(input.idToken, config)

  const user = await upsertUserByFirebaseIdentity(env.DB, {
    subject: firebaseIdentity.sub,
    email: firebaseIdentity.email,
    name: firebaseIdentity.name,
    picture: firebaseIdentity.picture,
  })

  const sessionId = newId()
  const accessToken = await issueAccessToken(config, user.id, sessionId)
  const refreshToken = await issueRefreshToken(config, user.id, sessionId)
  const tokenHash = await hashRefreshToken(
    refreshToken,
    config.refreshTokenPepper,
  )

  await createRefreshSession(env.DB, {
    sessionId,
    userId: user.id,
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
      id: user.id,
      email: user.primaryEmail,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      provider: 'firebase',
    },
  }
}
