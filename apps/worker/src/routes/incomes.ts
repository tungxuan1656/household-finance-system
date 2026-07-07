import { Hono } from 'hono'

import { createIncomeHandler } from '@/handlers/incomes/create-income'
import { deleteIncomeHandler } from '@/handlers/incomes/delete-income'
import { listIncomesHandler } from '@/handlers/incomes/list-incomes'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const incomesRoutes = new Hono<AppBindings>()

// All income routes require authentication
incomesRoutes.use('/incomes', authMiddleware)
incomesRoutes.use('/incomes/:id', authMiddleware)

// POST /api/v1/incomes
incomesRoutes.post('/incomes', async (ctx) => {
  const dto = await createIncomeHandler(ctx)

  return success<typeof dto>(ctx, dto, 201)
})

// GET /api/v1/incomes
incomesRoutes.get('/incomes', async (ctx) => {
  const result = await listIncomesHandler(ctx)

  return success<typeof result>(ctx, result)
})

// DELETE /api/v1/incomes/:id
incomesRoutes.delete('/incomes/:id', async (ctx) => {
  const result = await deleteIncomeHandler(ctx)

  return success<typeof result>(ctx, result)
})
