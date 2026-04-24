import { internalError } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import type { AppConfig } from '@/types'

const DEFAULT_FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
const DEFAULT_APP_ENVIRONMENT = 'local'
const DEFAULT_CLOUDINARY_MAX_IMAGE_BYTES = 10 * 1024 * 1024
const DEFAULT_CLOUDINARY_MAX_VIDEO_BYTES = 100 * 1024 * 1024
const DEFAULT_CLOUDINARY_ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
]
const DEFAULT_CLOUDINARY_ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
]

const toBoolean = (value: string | undefined): boolean =>
  value?.toLowerCase() === 'true'

const envConfigError = (): ReturnType<typeof internalError> =>
  internalError(defaultLocale, 'errors.workerConfigurationInvalid')

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

const readOptionalPositiveInteger = (
  env: Env,
  key: string,
  fallback: number,
): number => {
  const value = readOptional(env, key)

  return value === undefined ? fallback : toPositiveInteger(value)
}

const readOptionalCsvLowercase = (
  env: Env,
  key: string,
  fallback: string[],
): string[] => {
  const value = readOptional(env, key)

  if (value === undefined) {
    return fallback
  }

  const entries = value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)

  if (entries.length === 0) {
    throw envConfigError()
  }

  return [...new Set(entries)]
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
    appEnvironment:
      readOptional(env, 'APP_ENV')?.trim() || DEFAULT_APP_ENVIRONMENT,
    cloudinaryCloudName: readRequired(env, 'CLOUDINARY_CLOUD_NAME'),
    cloudinaryApiKey: readRequired(env, 'CLOUDINARY_API_KEY'),
    cloudinaryApiSecret: readRequired(env, 'CLOUDINARY_API_SECRET'),
    cloudinaryMaxImageBytes: readOptionalPositiveInteger(
      env,
      'CLOUDINARY_MAX_IMAGE_BYTES',
      DEFAULT_CLOUDINARY_MAX_IMAGE_BYTES,
    ),
    cloudinaryMaxVideoBytes: readOptionalPositiveInteger(
      env,
      'CLOUDINARY_MAX_VIDEO_BYTES',
      DEFAULT_CLOUDINARY_MAX_VIDEO_BYTES,
    ),
    cloudinaryAllowedImageMimeTypes: readOptionalCsvLowercase(
      env,
      'CLOUDINARY_ALLOWED_IMAGE_MIME_TYPES',
      DEFAULT_CLOUDINARY_ALLOWED_IMAGE_MIME_TYPES,
    ),
    cloudinaryAllowedVideoMimeTypes: readOptionalCsvLowercase(
      env,
      'CLOUDINARY_ALLOWED_VIDEO_MIME_TYPES',
      DEFAULT_CLOUDINARY_ALLOWED_VIDEO_MIME_TYPES,
    ),
  }
}
