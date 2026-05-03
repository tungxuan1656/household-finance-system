import { Hono } from 'hono'

import { createExpenseHandler } from '@/handlers/expenses/create-expense'
import { deleteExpenseHandler } from '@/handlers/expenses/delete-expense'
import { getExpenseHandler } from '@/handlers/expenses/get-expense'
import { listDeletedExpensesHandler } from '@/handlers/expenses/list-deleted-expenses'
import { listExpensesHandler } from '@/handlers/expenses/list-expenses'
import { restoreExpenseHandler } from '@/handlers/expenses/restore-expense'
import { updateExpenseHandler } from '@/handlers/expenses/update-expense'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const expensesRoutes = new Hono<AppBindings>()

// All expense routes require authentication
expensesRoutes.use('/expenses', authMiddleware)
expensesRoutes.use('/expenses/deleted', authMiddleware)
expensesRoutes.use('/expenses/:id', authMiddleware)
expensesRoutes.use('/expenses/:id/restore', authMiddleware)

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

// GET /api/v1/expenses/deleted?household_id=...
expensesRoutes.get('/expenses/deleted', async (ctx) => {
  const result = await listDeletedExpensesHandler(ctx)

  return success<typeof result>(ctx, result)
})

// GET /api/v1/expenses/:id
expensesRoutes.get('/expenses/:id', async (ctx) => {
  const dto = await getExpenseHandler(ctx)

  return success<typeof dto>(ctx, dto)
})

// PATCH /api/v1/expenses/:id
expensesRoutes.patch('/expenses/:id', async (ctx) => {
  const dto = await updateExpenseHandler(ctx)

  return success<typeof dto>(ctx, dto)
})

// DELETE /api/v1/expenses/:id
expensesRoutes.delete('/expenses/:id', async (ctx) => {
  const result = await deleteExpenseHandler(ctx)

  return success<typeof result>(ctx, result)
})

// POST /api/v1/expenses/:id/restore
expensesRoutes.post('/expenses/:id/restore', async (ctx) => {
  const dto = await restoreExpenseHandler(ctx)

  return success<typeof dto>(ctx, dto)
})
