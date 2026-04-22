import type { MiddlewareHandler } from 'hono'

import {
  findSessionById,
  isSessionActive,
} from '@/db/repositories/session-repository'
import { findUserById } from '@/db/repositories/user-repository'
import type { AppBindings } from '@/dto'
import { readConfig } from '@/lib/env'
import { unauthenticated } from '@/lib/errors'
import { verifyAccessToken } from '@/utils/auth/jwt'

const getBearerToken = (authorizationHeader: string | undefined): string => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw unauthenticated('Missing bearer token.')
  }

  const token = authorizationHeader.slice('Bearer '.length).trim()

  if (!token) {
    throw unauthenticated('Missing bearer token.')
  }

  return token
}

export const authMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const config = readConfig(ctx.env)
  const token = getBearerToken(ctx.req.header('authorization'))
  const payload = await verifyAccessToken(token, config)

  const session = await findSessionById(ctx.env.DB, payload.sid)

  if (!session || !isSessionActive(session) || session.userId !== payload.sub) {
    throw unauthenticated('Session has expired or is revoked.')
  }

  const user = await findUserById(ctx.env.DB, payload.sub)

  if (!user) {
    throw unauthenticated('User is no longer available.')
  }

  ctx.set('currentSessionId', payload.sid)

  ctx.set('currentUser', {
    id: user.id,
    email: user.primaryEmail,
    provider: 'firebase',
  })

  await next()
}
