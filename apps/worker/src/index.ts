import { Hono } from 'hono'

import { notFound } from '@/lib/errors'
import { fromUnknownError } from '@/lib/response'
import { requestContextMiddleware } from '@/middlewares/request-context'
import { authRoutes } from '@/routes/auth'
import { healthRoutes } from '@/routes/health'
import { profileRoutes } from '@/routes/profile'
import { protectedRoutes } from '@/routes/protected'
import type { AppBindings } from '@/types'

const app = new Hono<AppBindings>()

app.use('*', requestContextMiddleware)

app.onError((error, ctx) => fromUnknownError(ctx, error))

app.notFound((ctx) => {
  throw notFound(ctx.get('locale'), 'errors.routeNotFound')
})

app.route('/api/v1', healthRoutes)
app.route('/api/v1', authRoutes)
app.route('/api/v1', profileRoutes)
app.route('/api/v1', protectedRoutes)

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>
