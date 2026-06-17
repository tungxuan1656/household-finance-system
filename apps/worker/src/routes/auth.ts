import { Hono } from 'hono'

import {
  exchangeProviderRequestSchema,
  refreshSessionRequestSchema,
} from '@/contracts'
import { exchangeProviderToken } from '@/handlers/auth/exchange-provider-token'
import { logoutSession } from '@/handlers/auth/logout-session'
import { refreshSession } from '@/handlers/auth/refresh-session'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'
import { rateLimitMiddleware } from '@/middlewares/rate-limit'
import type { AppBindings } from '@/types'

export const authRoutes = new Hono<AppBindings>()

authRoutes.use('*', rateLimitMiddleware)

authRoutes.post('/auth/provider/exchange', async (ctx) => {
  const locale = ctx.get('locale')
  const body = await readJsonBody(
    ctx.req.raw,
    exchangeProviderRequestSchema,
    locale,
  )
  const userAgent = ctx.req.header('user-agent') ?? null
  const ipAddress = ctx.req.header('cf-connecting-ip') ?? null

  if (body.provider === 'telegram') {
    const result = await exchangeProviderToken(ctx.env, {
      provider: 'telegram',
      initData: body.initData,
      locale,
      userAgent,
      ipAddress,
    })

    return success(ctx, result)
  }

  const result = await exchangeProviderToken(ctx.env, {
    provider: 'firebase',
    idToken: body.idToken,
    locale,
    userAgent,
    ipAddress,
  })

  return success(ctx, result)
})

authRoutes.post('/auth/refresh', async (ctx) => {
  const locale = ctx.get('locale')
  const body = await readJsonBody(
    ctx.req.raw,
    refreshSessionRequestSchema,
    locale,
  )
  const result = await refreshSession(ctx.env, {
    refreshToken: body.refreshToken,
    locale,
    userAgent: ctx.req.header('user-agent') ?? null,
    ipAddress: ctx.req.header('cf-connecting-ip') ?? null,
  })

  return success(ctx, result)
})

authRoutes.use('/auth/logout', authMiddleware)

authRoutes.post('/auth/logout', async (ctx) => {
  const locale = ctx.get('locale')
  const result = await logoutSession(ctx.env, {
    currentSessionId: ctx.get('currentSessionId'),
    requestEpoch: ctx.get('requestEpoch'),
    locale,
  })

  return success(ctx, result)
})
