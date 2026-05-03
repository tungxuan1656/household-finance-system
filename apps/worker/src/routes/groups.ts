import { Hono } from 'hono'

import { archiveExpenseGroupHandler } from '@/handlers/expense-groups/archive-expense-group'
import { createExpenseGroupHandler } from '@/handlers/expense-groups/create-expense-group'
import { getExpenseGroupHandler } from '@/handlers/expense-groups/get-expense-group'
import { getGroupSummaryHandler } from '@/handlers/expense-groups/get-group-summary'
import { listExpenseGroupsHandler } from '@/handlers/expense-groups/list-expense-groups'
import { updateExpenseGroupHandler } from '@/handlers/expense-groups/update-expense-group'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const groupsRoutes = new Hono<AppBindings>()

// All group routes require authentication
groupsRoutes.use('/groups', authMiddleware)
groupsRoutes.use('/groups/*', authMiddleware)

// POST /api/v1/groups
groupsRoutes.post('/groups', async (ctx) => {
  const dto = await createExpenseGroupHandler(ctx)

  return success<typeof dto>(ctx, dto, 201)
})

// GET /api/v1/groups?household_id=...
groupsRoutes.get('/groups', async (ctx) => {
  const result = await listExpenseGroupsHandler(ctx)

  return success<typeof result>(ctx, result)
})

// GET /api/v1/groups/:id
groupsRoutes.get('/groups/:id', async (ctx) => {
  const dto = await getExpenseGroupHandler(ctx)

  return success<typeof dto>(ctx, dto)
})

// PATCH /api/v1/groups/:id
groupsRoutes.patch('/groups/:id', async (ctx) => {
  const dto = await updateExpenseGroupHandler(ctx)

  return success<typeof dto>(ctx, dto)
})

// POST /api/v1/groups/:id/archive
groupsRoutes.post('/groups/:id/archive', async (ctx) => {
  const result = await archiveExpenseGroupHandler(ctx)

  return success<typeof result>(ctx, result)
})

// GET /api/v1/groups/:id/summary
groupsRoutes.get('/groups/:id/summary', async (ctx) => {
  const dto = await getGroupSummaryHandler(ctx)

  return success<typeof dto>(ctx, dto)
})
