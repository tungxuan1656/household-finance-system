import { Hono } from 'hono'

import { createExpenseHandler } from '@/handlers/expenses/create-expense'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const expensesRoutes = new Hono<AppBindings>()

// POST /api/v1/expenses
expensesRoutes.use('/expenses', authMiddleware)

expensesRoutes.post('/expenses', async (ctx) => {
  const dto = await createExpenseHandler(ctx)

  return success<typeof dto>(ctx, dto, 201)
})
