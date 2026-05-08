import { Hono } from 'hono'

import { getAnalyticsComparisonHandler } from '@/handlers/analytics/get-analytics-comparison'
import { getAnalyticsExportHandler } from '@/handlers/analytics/get-analytics-export'
import { getAnalyticsGroupsHandler } from '@/handlers/analytics/get-analytics-groups'
import { getAnalyticsOverviewHandler } from '@/handlers/analytics/get-analytics-overview'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const analyticsRoutes = new Hono<AppBindings>()

analyticsRoutes.use('/analytics/overview', authMiddleware)
analyticsRoutes.use('/analytics/comparison', authMiddleware)
analyticsRoutes.use('/analytics/groups', authMiddleware)
analyticsRoutes.use('/analytics/export', authMiddleware)

analyticsRoutes.get('/analytics/overview', async (ctx) => {
  const result = await getAnalyticsOverviewHandler(ctx)

  return success<typeof result>(ctx, result)
})

analyticsRoutes.get('/analytics/comparison', async (ctx) => {
  const result = await getAnalyticsComparisonHandler(ctx)

  return success<typeof result>(ctx, result)
})

analyticsRoutes.get('/analytics/groups', async (ctx) => {
  const result = await getAnalyticsGroupsHandler(ctx)

  return success<typeof result>(ctx, result)
})

analyticsRoutes.get('/analytics/export', async (ctx) => {
  return getAnalyticsExportHandler(ctx)
})
