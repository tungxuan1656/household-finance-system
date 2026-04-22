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
import type { AppBindings } from '@/types'

export const authRoutes = new Hono<AppBindings>()

authRoutes.post('/auth/provider/exchange', async (ctx) => {
  const locale = ctx.get('locale')
  const body = await readJsonBody(
    ctx.req.raw,
    exchangeProviderRequestSchema,
    locale,
  )
  const result = await exchangeProviderToken(ctx.env, {
    provider: body.provider,
    idToken: body.idToken,
    locale,
    userAgent: ctx.req.header('user-agent') ?? null,
    ipAddress: ctx.req.header('cf-connecting-ip') ?? null,
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
