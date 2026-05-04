import { Hono } from 'hono'

import { getAnalyticsOverviewHandler } from '@/handlers/analytics/get-analytics-overview'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const analyticsRoutes = new Hono<AppBindings>()

analyticsRoutes.use('/analytics/overview', authMiddleware)

analyticsRoutes.get('/analytics/overview', async (ctx) => {
  const result = await getAnalyticsOverviewHandler(ctx)

  return success<typeof result>(ctx, result)
})
