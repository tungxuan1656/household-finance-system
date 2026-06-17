import type { MiddlewareHandler } from 'hono'

import type { AppBindings } from '@/types'

export const securityHeadersMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  ctx.header('X-Content-Type-Options', 'nosniff')
  ctx.header('X-Frame-Options', 'DENY')
  ctx.header('Referrer-Policy', 'no-referrer')

  ctx.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  ctx.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  await next()
}
