import { jwtVerify, SignJWT } from 'jose'

import { unauthenticated } from '@/lib/errors'
import { defaultLocale, type SupportedLocale } from '@/lib/i18n'
import type { AppConfig, SessionTokenKind, SessionTokenPayload } from '@/types'

const encoder = new TextEncoder()

const issueToken = async (
  config: AppConfig,
  payload: SessionTokenPayload,
  ttlSeconds: number,
): Promise<string> => {
  const nowSeconds = Math.floor(Date.now() / 1000)

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(nowSeconds)
    .setIssuer(config.authIssuer)
    .setAudience(config.authAudience)
    .setSubject(payload.sub)
    .setExpirationTime(nowSeconds + ttlSeconds)
    .sign(encoder.encode(config.authJwtSecret))
}

export const issueAccessToken = (
  config: AppConfig,
  userId: string,
  sessionId: string,
): Promise<string> =>
  issueToken(
    config,
    { sub: userId, sid: sessionId, typ: 'access' },
    config.accessTokenTtlSeconds,
  )

export const issueRefreshToken = (
  config: AppConfig,
  userId: string,
  sessionId: string,
): Promise<string> =>
  issueToken(
    config,
    { sub: userId, sid: sessionId, typ: 'refresh' },
    config.refreshTokenTtlSeconds,
  )

const verifyToken = async (
  token: string,
  config: AppConfig,
  expectedType: SessionTokenKind,
  locale: SupportedLocale = defaultLocale,
): Promise<SessionTokenPayload> => {
  let result

  try {
    result = await jwtVerify(token, encoder.encode(config.authJwtSecret), {
      issuer: config.authIssuer,
      audience: config.authAudience,
      algorithms: ['HS256'],
    })
  } catch {
    throw unauthenticated(locale, 'errors.invalidOrExpiredSessionToken')
  }

  const payload = result.payload

  if (
    typeof payload.sub !== 'string' ||
    typeof payload.sid !== 'string' ||
    (payload.typ !== 'access' && payload.typ !== 'refresh') ||
    payload.typ !== expectedType
  ) {
    throw unauthenticated(locale, 'errors.invalidSessionTokenPayload')
  }

  return {
    sub: payload.sub,
    sid: payload.sid,
    typ: payload.typ,
  }
}

export const verifyAccessToken = (
  token: string,
  config: AppConfig,
  locale: SupportedLocale = defaultLocale,
): Promise<SessionTokenPayload> => verifyToken(token, config, 'access', locale)

export const verifyRefreshToken = (
  token: string,
  config: AppConfig,
  locale: SupportedLocale = defaultLocale,
): Promise<SessionTokenPayload> => verifyToken(token, config, 'refresh', locale)
