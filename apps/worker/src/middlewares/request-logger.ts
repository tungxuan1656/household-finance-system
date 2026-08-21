import type { MiddlewareHandler } from 'hono'

import { logger } from '@/lib/logger'
import type { AppBindings } from '@/types'

const MAX_USER_AGENT = 200

export const requestLoggerMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const start =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now()

  let requestId: string | undefined
  try {
    requestId = ctx.get('requestId')
  } catch {
    requestId = undefined
  }

  try {
    await next()
  } finally {
    const end =
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
        ? performance.now()
        : Date.now()
    const durationMs = Math.round(end - start)

    if (requestId) {
      ctx.header('x-request-id', requestId)
    }

    const status = ctx.res.status || 500
    const method = ctx.req.method

    let pathname = ''
    try {
      pathname = new URL(ctx.req.url).pathname
    } catch {
      pathname = ctx.req.path
    }

    const cfRay = ctx.req.header('cf-ray')
    const userAgentRaw = ctx.req.header('user-agent')
    const userAgent = userAgentRaw
      ? userAgentRaw.slice(0, MAX_USER_AGENT)
      : undefined

    let userId: string | undefined
    try {
      const u = ctx.get('currentUser') as { id?: string } | undefined
      if (u?.id) userId = u.id
    } catch {
      userId = undefined
    }

    const logFields: Record<string, unknown> = {
      method,
      path: pathname,
      status,
      durationMs,
      cfRay,
      userAgent,
      userId,
    }

    Object.keys(logFields).forEach((k) => {
      if (logFields[k] === undefined) delete logFields[k]
    })

    if (status >= 500) {
      logger.error(requestId, 'request', logFields)
    } else if (status >= 400) {
      logger.warn(requestId, 'request', logFields)
    } else {
      logger.info(requestId, 'request', logFields)
    }
  }
}
