import { Hono } from 'hono'

import { migrateExpensesHandler } from '@/handlers/migrate/migrate-expenses'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const migrateRoutes = new Hono<AppBindings>()

// All migrate routes require authentication
migrateRoutes.use('/migrate/*', authMiddleware)

// POST /api/v1/migrate/expenses
migrateRoutes.post('/migrate/expenses', async (ctx) => {
  const result = await migrateExpensesHandler(ctx)

  return success<typeof result>(ctx, result, 200)
})
