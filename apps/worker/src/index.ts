import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { notFound } from '@/lib/errors'
import { fromUnknownError } from '@/lib/response'
import { requestContextMiddleware } from '@/middlewares/request-context'
import { authRoutes } from '@/routes/auth'
import { healthRoutes } from '@/routes/health'
import { mediaRoutes } from '@/routes/media'
import { profileRoutes } from '@/routes/profile'
import { protectedRoutes } from '@/routes/protected'
import type { AppBindings } from '@/types'

const app = new Hono<AppBindings>()

app.use('*', requestContextMiddleware)

// Middleware
const allowedOrigins = [
  'https://3000-viec-thien.web.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
]

app.use(
  '/*',
  cors({
    origin: (origin) => {
      if (!origin) {
        return ''
      }

      return allowedOrigins.includes(origin) ? origin : ''
    },
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
app.route('/api/v1', mediaRoutes)
app.route('/api/v1', protectedRoutes)

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>
