import type { MiddlewareHandler } from 'hono'

import {
  findSessionById,
  isSessionActive,
} from '@/db/repositories/session-repository'
import { findUserById } from '@/db/repositories/user-repository'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { readConfig } from '@/lib/env'
import { unauthenticated } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

const getBearerToken = (
  authorizationHeader: string | undefined,
  locale: SupportedLocale,
): string => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw unauthenticated(locale, 'errors.missingBearerToken')
  }

  const token = authorizationHeader.slice('Bearer '.length).trim()

  if (!token) {
    throw unauthenticated(locale, 'errors.missingBearerToken')
  }

  return token
}

export const authMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const config = readConfig(ctx.env)
  const locale: SupportedLocale = ctx.get('locale')

  const requestEpoch = Date.now()
  ctx.set('requestEpoch', requestEpoch)

  const token = getBearerToken(ctx.req.header('authorization'), locale)
  const payload = await verifyAccessToken(token, config, locale)

  const [session, user] = await Promise.all([
    findSessionById(ctx.env.DB, payload.sid),
    findUserById(ctx.env.DB, payload.sub),
  ])

  if (!session || !isSessionActive(session) || session.userId !== payload.sub) {
    throw unauthenticated(locale, 'errors.sessionExpiredOrRevoked')
  }

  if (!user) {
    throw unauthenticated(locale, 'errors.userUnavailable')
  }

  ctx.set('currentSessionId', payload.sid)

  ctx.set('currentUser', {
    id: user.id,
    email: user.primaryEmail,
    provider: 'firebase',
  })

  await next()
}
