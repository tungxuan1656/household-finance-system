import { Hono } from 'hono'

import { createExpenseHandler } from '@/handlers/expenses/create-expense'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const expensesRoutes = new Hono<AppBindings>()

// POST /api/v1/expenses
expensesRoutes.use('/expenses', authMiddleware)

expensesRoutes.post('/expenses', async (ctx) => {
  // Delegate to handler which uses the same ctx convention
  // The handler expects to access ctx.req, ctx.env, ctx.get, etc.
  const dto = await createExpenseHandler(ctx as any)

  return success<typeof dto>(ctx, dto, 201)
})
