import type { AppConfig } from '@/dto'
import { internalError } from '@/lib/errors'

const DEFAULT_FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

const toBoolean = (value: string | undefined): boolean =>
  value?.toLowerCase() === 'true'

const envConfigError = (): ReturnType<typeof internalError> =>
  internalError('Worker configuration is invalid.')

const toPositiveInteger = (value: string | undefined): number => {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw envConfigError()
  }

  return parsed
}

const readRequired = (env: Env, key: string): string => {
  const rawValue = (env as unknown as Record<string, unknown>)[key]

  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    throw envConfigError()
  }

  return rawValue
}

const readOptional = (env: Env, key: string): string | undefined => {
  const rawValue = (env as unknown as Record<string, unknown>)[key]

  return typeof rawValue === 'string' ? rawValue : undefined
}

export const assertDatabaseBinding = (env: Env): D1Database => {
  if (!env.DB || typeof env.DB.prepare !== 'function') {
    throw envConfigError()
  }

  return env.DB
}

export const readConfig = (env: Env): AppConfig => {
  assertDatabaseBinding(env)

  return {
    authIssuer: readRequired(env, 'AUTH_ISSUER'),
    authAudience: readRequired(env, 'AUTH_AUDIENCE'),
    accessTokenTtlSeconds: toPositiveInteger(
      readRequired(env, 'ACCESS_TOKEN_TTL_SECONDS'),
    ),
    refreshTokenTtlSeconds: toPositiveInteger(
      readRequired(env, 'REFRESH_TOKEN_TTL_SECONDS'),
    ),
    authJwtSecret: readRequired(env, 'AUTH_JWT_SECRET'),
    refreshTokenPepper: readRequired(env, 'AUTH_REFRESH_TOKEN_PEPPER'),
    firebaseProjectId: readRequired(env, 'FIREBASE_PROJECT_ID'),
    firebaseJwksUrl:
      readOptional(env, 'FIREBASE_JWKS_URL') ?? DEFAULT_FIREBASE_JWKS_URL,
    allowInsecureTestTokens: toBoolean(
      readOptional(env, 'AUTH_ALLOW_INSECURE_TEST_TOKENS'),
    ),
  }
}
