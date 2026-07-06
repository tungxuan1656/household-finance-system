import type { MiddlewareHandler } from 'hono'

import { readConfig } from '@/lib/env'
import { unauthenticated } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

/**
 * Constant-time string comparison to prevent timing attacks.
 */
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false

  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)
  let result = 0

  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i]! ^ bBytes[i]!
  }

  return result === 0
}

/**
 * Middleware that authenticates internal requests using the X-Internal-Api-Key header.
 *
 * Reads INTERNAL_API_KEY from worker env. If the secret is not configured,
 * all requests are rejected as unauthenticated.
 * On success, does NOT set `currentUser` — this is an admin/internal path
 * that operates on a target user specified in the request body.
 */
export const internalAuthMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const config = readConfig(ctx.env)
  const locale: SupportedLocale = ctx.get('locale')

  const expectedKey = config.internalApiKey

  if (!expectedKey) {
    throw unauthenticated(locale, 'errors.authenticationRequired')
  }

  const providedKey = ctx.req.header('X-Internal-Api-Key')

  if (!providedKey) {
    throw unauthenticated(locale, 'errors.authenticationRequired')
  }

  if (!timingSafeEqual(providedKey, expectedKey)) {
    throw unauthenticated(locale, 'errors.authenticationRequired')
  }

  await next()
}
