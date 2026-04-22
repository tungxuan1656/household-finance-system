import { SignJWT } from 'jose'
import { describe, expect, it } from 'vitest'

import { AppError } from '@/lib/errors'
import {
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth/jwt'

const encoder = new TextEncoder()

const config = {
  authIssuer: 'https://household-finance.local',
  authAudience: 'household-finance-api',
  accessTokenTtlSeconds: 3600,
  refreshTokenTtlSeconds: 7200,
  authJwtSecret: 'test-jwt-secret',
  refreshTokenPepper: 'test-pepper',
  firebaseProjectId: 'household-finance-local',
  firebaseJwksUrl:
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  allowInsecureTestTokens: true,
}

describe('jwt utilities', () => {
  it('issues and verifies an access token', async () => {
    const token = await issueAccessToken(config, 'user-1', 'session-1')
    const payload = await verifyAccessToken(token, config)

    expect(payload.sub).toBe('user-1')
    expect(payload.sid).toBe('session-1')
    expect(payload.typ).toBe('access')
  })

  it('rejects refresh token in access verification path', async () => {
    const refreshToken = await issueRefreshToken(config, 'user-2', 'session-2')

    await expect(verifyAccessToken(refreshToken, config)).rejects.toMatchObject(
      {
        code: 'UNAUTHENTICATED',
      },
    )
  })

  it('rejects token payload without sid', async () => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const invalidToken = await new SignJWT({ typ: 'access' })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(nowSeconds)
      .setIssuer(config.authIssuer)
      .setAudience(config.authAudience)
      .setSubject('user-3')
      .setExpirationTime(nowSeconds + 60)
      .sign(encoder.encode(config.authJwtSecret))

    await expect(
      verifyAccessToken(invalidToken, config),
    ).rejects.toBeInstanceOf(AppError)

    try {
      await verifyAccessToken(invalidToken, config)
    } catch (error) {
      expect((error as AppError).code).toBe('UNAUTHENTICATED')
    }
  })

  it('verifies refresh token on refresh path', async () => {
    const token = await issueRefreshToken(config, 'user-4', 'session-4')
    const payload = await verifyRefreshToken(token, config)

    expect(payload.sub).toBe('user-4')
    expect(payload.sid).toBe('session-4')
    expect(payload.typ).toBe('refresh')
  })
})
