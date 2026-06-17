import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { resolveCorsOrigin } from '@/lib/cors'
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
import { profileRoutes } from '@/routes/profile'
import { protectedRoutes } from '@/routes/protected'
import { referenceDataRoutes } from '@/routes/reference-data'
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
app.route('/api/v1', groupsRoutes)
app.route('/api/v1', budgetsRoutes)

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>
