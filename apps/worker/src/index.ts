import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { runBudgetAlerts } from '@/bot/notifications/budget-alerts'
import { runWeeklyDigest } from '@/bot/notifications/weekly-digest'
import { TelegramClient } from '@/bot/telegram-client'
import { resolveCorsOrigin } from '@/lib/cors'
import { readConfig } from '@/lib/env'
import { notFound } from '@/lib/errors'
import { fromUnknownError } from '@/lib/response'
import { requestContextMiddleware } from '@/middlewares/request-context'
import { securityHeadersMiddleware } from '@/middlewares/security-headers'
import { analyticsRoutes } from '@/routes/analytics'
import { authRoutes } from '@/routes/auth'
import { budgetsRoutes } from '@/routes/budgets'
import { expensesRoutes } from '@/routes/expenses'
import { groupsRoutes } from '@/routes/groups'
import { healthRoutes } from '@/routes/health'
import { householdRoutes } from '@/routes/households'
import { invitationRoutes } from '@/routes/invitations'
import { mediaRoutes } from '@/routes/media'
import { migrateRoutes } from '@/routes/migrate'
import { profileRoutes } from '@/routes/profile'
import { protectedRoutes } from '@/routes/protected'
import { referenceDataRoutes } from '@/routes/reference-data'
import { telegramBotRoutes } from '@/routes/telegram-bot'
import type { AppBindings } from '@/types'

const app = new Hono<AppBindings>()

app.use('*', requestContextMiddleware)
app.use('*', securityHeadersMiddleware)

app.use(
  '/*',
  cors({
    origin: resolveCorsOrigin,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Type'],
    credentials: true,
  }),
)

app.onError((error, ctx) => fromUnknownError(ctx, error))

app.notFound((ctx) => {
  throw notFound(ctx.get('locale'), 'errors.routeNotFound')
})

app.route('/api/v1', healthRoutes)
app.route('/api/v1', authRoutes)
app.route('/api/v1', profileRoutes)
app.route('/api/v1', referenceDataRoutes)
app.route('/api/v1', householdRoutes)
app.route('/api/v1', invitationRoutes)
app.route('/api/v1', mediaRoutes)
app.route('/api/v1', protectedRoutes)
app.route('/api/v1', analyticsRoutes)
app.route('/api/v1', expensesRoutes)
app.route('/api/v1', migrateRoutes)
app.route('/api/v1', groupsRoutes)
app.route('/api/v1', budgetsRoutes)
app.route('/api/v1', telegramBotRoutes)

/**
 * Cron-triggered notification jobs.
 * Daily at 9am UTC: budget alerts.
 * Weekly (Monday): weekly digest.
 */
const scheduled: ExportedHandler<Env>['scheduled'] = async (
  controller,
  env,
) => {
  const config = readConfig(env)
  const client = new TelegramClient(config.telegramBotToken)
  const db = env.DB

  try {
    // Daily jobs
    await runBudgetAlerts(db, client, config.telegramBotTmaUrl)

    // Weekly digest — run on Monday (cron expression handles frequency)
    await runWeeklyDigest(db, client, config.telegramBotDeepLinkUrl)
  } catch (error) {
    console.error('scheduled: notification jobs failed', error)
  }
}

export default {
  fetch: app.fetch,
  scheduled,
} satisfies ExportedHandler<Env>
