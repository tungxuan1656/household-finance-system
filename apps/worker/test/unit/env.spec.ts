import { describe, expect, it } from 'vitest'

import { AppError } from '@/lib/errors'
import { assertDatabaseBinding, readConfig } from '@/lib/env'

const createEnv = (overrides: Partial<Record<string, unknown>> = {}): Env =>
  ({
    DB: {
      prepare: () => ({}) as D1PreparedStatement,
    },
    AUTH_ISSUER: 'https://fos.local',
    AUTH_AUDIENCE: 'fos-api',
    ACCESS_TOKEN_TTL_SECONDS: '86400',
    REFRESH_TOKEN_TTL_SECONDS: '2592000',
    AUTH_JWT_SECRET: 'jwt-secret',
    AUTH_REFRESH_TOKEN_PEPPER: 'refresh-pepper',
    FIREBASE_PROJECT_ID: 'fos-prod',
    ...overrides,
  }) as unknown as Env

describe('env config', () => {
  it('reads config with defaults', () => {
    const config = readConfig(createEnv())

    expect(config.authIssuer).toBe('https://fos.local')
    expect(config.authAudience).toBe('fos-api')
    expect(config.accessTokenTtlSeconds).toBe(86400)
    expect(config.refreshTokenTtlSeconds).toBe(2592000)
    expect(config.firebaseProjectId).toBe('fos-prod')
    expect(config.allowInsecureTestTokens).toBe(false)
    expect(config.firebaseJwksUrl).toContain(
      'securetoken@system.gserviceaccount.com',
    )
  })

  it('throws INTERNAL_ERROR when required value is missing', () => {
    expect(() =>
      readConfig(
        createEnv({
          AUTH_ISSUER: '   ',
        }),
      ),
    ).toThrow(AppError)

    try {
      readConfig(
        createEnv({
          AUTH_ISSUER: '',
        }),
      )
    } catch (error) {
      expect((error as AppError).code).toBe('INTERNAL_ERROR')
    }
  })

  it('throws INTERNAL_ERROR when token TTL is invalid', () => {
    expect(() =>
      readConfig(
        createEnv({
          ACCESS_TOKEN_TTL_SECONDS: '0',
        }),
      ),
    ).toThrowError(
      expect.objectContaining({
        code: 'INTERNAL_ERROR',
      }),
    )
  })

  it('throws INTERNAL_ERROR when D1 binding is missing', () => {
    expect(() =>
      assertDatabaseBinding({
        DB: undefined,
      } as unknown as Env),
    ).toThrowError(
      expect.objectContaining({
        code: 'INTERNAL_ERROR',
      }),
    )
  })
})
