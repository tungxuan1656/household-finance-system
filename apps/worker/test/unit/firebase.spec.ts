import { describe, expect, it } from 'vitest'

import { AppError } from '@/lib/errors'
import { verifyFirebaseIdToken } from '@/lib/auth/firebase'

const baseConfig = {
  authIssuer: 'https://household-finance.local',
  authAudience: 'household-finance-api',
  accessTokenTtlSeconds: 3600,
  refreshTokenTtlSeconds: 7200,
  authJwtSecret: 'test-jwt-secret',
  refreshTokenPepper: 'test-pepper',
  firebaseProjectId: 'household-finance-prod',
  firebaseJwksUrl:
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  allowInsecureTestTokens: false,
}

describe('firebase token verification', () => {
  it('accepts unsafe test token when allowed', async () => {
    const payload = await verifyFirebaseIdToken(
      'test:user-1:user1@example.com:User One:https://cdn.example.com/user-one.png',
      {
        ...baseConfig,
        allowInsecureTestTokens: true,
      },
    )

    expect(payload.sub).toBe('user-1')
    expect(payload.email).toBe('user1@example.com')
    expect(payload.emailVerified).toBe(true)
    expect(payload.name).toBe('User One')
    expect(payload.picture).toBe('https://cdn.example.com/user-one.png')
  })

  it('rejects unsafe test token when allow flag is disabled, even in local project', async () => {
    await expect(
      verifyFirebaseIdToken('test:user-2:user2@example.com', {
        ...baseConfig,
        firebaseProjectId: 'household-finance-local',
      }),
    ).rejects.toBeInstanceOf(AppError)
  })

  it('rejects invalid token when unsafe tokens are disabled', async () => {
    await expect(
      verifyFirebaseIdToken('test:user-3:user3@example.com', baseConfig),
    ).rejects.toBeInstanceOf(AppError)

    try {
      await verifyFirebaseIdToken('test:user-3:user3@example.com', baseConfig)
    } catch (error) {
      expect((error as AppError).code).toBe('UNAUTHENTICATED')
    }
  })
})
