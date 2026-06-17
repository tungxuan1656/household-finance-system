import type { MiddlewareHandler } from 'hono'

import { AppError, ERROR_CODES } from '@/lib/errors'
import { defaultLocale, translate } from '@/lib/i18n'
import type { AppBindings } from '@/types'

const WINDOW_MS = 60_000
const DEFAULT_MAX_REQUESTS = 10

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

const parsePositiveInt = (
  raw: string | undefined,
  fallback: number,
): number => {
  if (raw === undefined) {
    return fallback
  }

  const parsed = Number.parseInt(raw, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const rateLimitMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const appEnv: string | undefined = ctx.env.APP_ENV

  if (appEnv !== undefined && NON_PRODUCTION_ENVS.has(appEnv)) {
    await next()

    return
  }

  if ((ctx.env.RATE_LIMIT_ENABLED as string | undefined) === 'false') {
    await next()

    return
  }

  const maxRequests = parsePositiveInt(
    ctx.env.RATE_LIMIT_MAX_REQUESTS as string | undefined,
    DEFAULT_MAX_REQUESTS,
  )

  const ip = getClientIp(ctx)
  const now = Date.now()

  let bucket = buckets.get(ip)

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(ip, bucket)
  }

  bucket.count++

  if (bucket.count > maxRequests) {
    const locale = ctx.get('locale') ?? defaultLocale

    throw new AppError(
      429,
      ERROR_CODES.RATE_LIMITED,
      translate(locale, 'errors.tooManyRequests'),
    )
  }

  await next()
}
