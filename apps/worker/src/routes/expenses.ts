import { Hono } from 'hono'

import { sendHouseholdActivity } from '@/bot/notifications/household-activity'
import { TelegramClient } from '@/bot/telegram-client'
import { replaceExpenseGroupsHandler } from '@/handlers/expense-groups/replace-expense-groups'
import { createExpenseHandler } from '@/handlers/expenses/create-expense'
import { deleteExpenseHandler } from '@/handlers/expenses/delete-expense'
import { getExpenseHandler } from '@/handlers/expenses/get-expense'
import { getExpenseSummaryHandler } from '@/handlers/expenses/get-expense-summary'
import { listDeletedExpensesHandler } from '@/handlers/expenses/list-deleted-expenses'
import { listExpensesHandler } from '@/handlers/expenses/list-expenses'
import { parseExpenseHandler } from '@/handlers/expenses/parse-expense'
import { restoreExpenseHandler } from '@/handlers/expenses/restore-expense'
import { updateExpenseHandler } from '@/handlers/expenses/update-expense'
import { readConfig } from '@/lib/env'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const expensesRoutes = new Hono<AppBindings>()

// All expense routes require authentication
expensesRoutes.use('/expenses', authMiddleware)
expensesRoutes.use('/expenses/parse', authMiddleware)
expensesRoutes.use('/expenses/deleted', authMiddleware)
expensesRoutes.use('/expenses/:id', authMiddleware)
expensesRoutes.use('/expenses/:id/restore', authMiddleware)
expensesRoutes.use('/expenses/:id/groups', authMiddleware)

// POST /api/v1/expenses
expensesRoutes.post('/expenses', async (ctx) => {
  const dto = await createExpenseHandler(ctx)

  // Fire-and-forget: household activity notification for household expenses
  if (dto.householdId) {
    const config = readConfig(ctx.env)
    const client = new TelegramClient(config.telegramBotToken)
    const currentUser = ctx.get('currentUser')
    // Get household name
    const { findHouseholdById } =
      await import('@/db/repositories/household-repository')
    const household = await findHouseholdById(ctx.env.DB, dto.householdId)
    const householdName = household?.name ?? ''

    sendHouseholdActivity({
      db: ctx.env.DB,
      telegramClient: client,
      householdId: dto.householdId,
      actorUserId: currentUser.id,
      expenseTitle: dto.title,
      expenseAmountMinor: dto.amountMinor,
      expenseCategoryKey: dto.categoryKey,
      expenseOccurredAt: new Date(dto.occurredAt).toISOString().slice(0, 10),
      expenseCurrencyCode: dto.currencyCode,
      householdName,
    }).catch((err: unknown) => {
      console.error('household-activity: send failed', err)
    })
  }

  return success<typeof dto>(ctx, dto, 201)
})

// GET /api/v1/expenses
expensesRoutes.get('/expenses', async (ctx) => {
  const result = await listExpensesHandler(ctx)

  return success<typeof result>(ctx, result)
})

// GET /api/v1/expenses/summary
expensesRoutes.get('/expenses/summary', async (ctx) => {
  const result = await getExpenseSummaryHandler(ctx)

  return success<typeof result>(ctx, result)
})

// GET /api/v1/expenses/deleted?household_id=...
expensesRoutes.get('/expenses/deleted', async (ctx) => {
  const result = await listDeletedExpensesHandler(ctx)

  return success<typeof result>(ctx, result)
})

// POST /api/v1/expenses/parse (before parameterised :id routes)
expensesRoutes.post('/expenses/parse', async (ctx) => {
  const result = await parseExpenseHandler(ctx)

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

// PATCH /api/v1/expenses/:id/groups
expensesRoutes.patch('/expenses/:id/groups', async (ctx) => {
  const dto = await replaceExpenseGroupsHandler(ctx)

  return success<typeof dto>(ctx, dto)
})
