import { Hono } from 'hono'

import {
  internalMigrateExpensesHandler,
  migrateExpensesHandler,
} from '@/handlers/migrate/migrate-expenses'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import { internalAuthMiddleware } from '@/middlewares/internal-auth'
import type { AppBindings } from '@/types'

export const migrateRoutes = new Hono<AppBindings>()

// Public routes — bearer-token self-service
migrateRoutes.use('/migrate/*', authMiddleware)

// POST /api/v1/migrate/expenses
migrateRoutes.post('/migrate/expenses', async (ctx) => {
  const result = await migrateExpensesHandler(ctx)

  return success<typeof result>(ctx, result, 200)
})

// Internal routes — X-Internal-Api-Key authentication
migrateRoutes.use('/internal/migrate/*', internalAuthMiddleware)

// POST /api/v1/internal/migrate/expenses
migrateRoutes.post('/internal/migrate/expenses', async (ctx) => {
  const result = await internalMigrateExpensesHandler(ctx)

  return success<typeof result>(ctx, result, 200)
})
