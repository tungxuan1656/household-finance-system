import { Hono } from 'hono'

import { createExpenseHandler } from '@/handlers/expenses/create-expense'
import { getExpenseHandler } from '@/handlers/expenses/get-expense'
import { listExpensesHandler } from '@/handlers/expenses/list-expenses'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const expensesRoutes = new Hono<AppBindings>()

// All expense routes require authentication
expensesRoutes.use('/expenses', authMiddleware)
expensesRoutes.use('/expenses/:id', authMiddleware)

// POST /api/v1/expenses
expensesRoutes.post('/expenses', async (ctx) => {
  const dto = await createExpenseHandler(ctx)

  return success<typeof dto>(ctx, dto, 201)
})

// GET /api/v1/expenses
expensesRoutes.get('/expenses', async (ctx) => {
  const result = await listExpensesHandler(ctx)

  return success<typeof result>(ctx, result)
})

// GET /api/v1/expenses/:id
expensesRoutes.get('/expenses/:id', async (ctx) => {
  const dto = await getExpenseHandler(ctx)

  return success<typeof dto>(ctx, dto)
})
