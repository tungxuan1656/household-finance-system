import type { MiddlewareHandler } from 'hono'

import { AppError, ERROR_CODES } from '@/lib/errors'
import type { AppBindings } from '@/types'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const getClientIp = (
  ctx: Parameters<MiddlewareHandler<AppBindings>>[0],
): string =>
  ctx.req.header('cf-connecting-ip') ??
  ctx.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
  'unknown'

const NON_PRODUCTION_ENVS = new Set(['local', 'test', 'development'])

export const rateLimitMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const appEnv: string | undefined = ctx.env.APP_ENV

  if (appEnv !== undefined && NON_PRODUCTION_ENVS.has(appEnv)) {
    await next()

    return
  }

  const ip = getClientIp(ctx)
  const now = Date.now()

  let bucket = buckets.get(ip)

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(ip, bucket)
  }

  bucket.count++

  if (bucket.count > MAX_REQUESTS) {
    throw new AppError(429, ERROR_CODES.RATE_LIMITED, 'Too many requests.')
  }

  await next()
}
