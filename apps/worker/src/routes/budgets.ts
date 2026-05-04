import { Hono } from 'hono'

import { createBudgetHandler } from '@/handlers/budgets/create-budget'
import { getBudgetHandler } from '@/handlers/budgets/get-budget'
import { getBudgetStatusHandler } from '@/handlers/budgets/get-budget-status'
import { listBudgetsHandler } from '@/handlers/budgets/list-budgets'
import { updateBudgetHandler } from '@/handlers/budgets/update-budget'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const budgetsRoutes = new Hono<AppBindings>()

// All budget routes require authentication
budgetsRoutes.use('/budgets', authMiddleware)
budgetsRoutes.use('/budgets/*', authMiddleware)

// POST /api/v1/budgets
budgetsRoutes.post('/budgets', async (ctx) => {
  const dto = await createBudgetHandler(ctx)

  return success<typeof dto>(ctx, dto, 201)
})

// GET /api/v1/budgets?household_id=...&period=...
budgetsRoutes.get('/budgets', async (ctx) => {
  const result = await listBudgetsHandler(ctx)

  return success<typeof result>(ctx, result)
})

// GET /api/v1/budgets/:id
budgetsRoutes.get('/budgets/:id', async (ctx) => {
  const dto = await getBudgetHandler(ctx)

  return success<typeof dto>(ctx, dto)
})

// GET /api/v1/budgets/:id/status
budgetsRoutes.get('/budgets/:id/status', async (ctx) => {
  const dto = await getBudgetStatusHandler(ctx)

  return success<typeof dto>(ctx, dto)
})

// PATCH /api/v1/budgets/:id
budgetsRoutes.patch('/budgets/:id', async (ctx) => {
  const dto = await updateBudgetHandler(ctx)

  return success<typeof dto>(ctx, dto)
})
