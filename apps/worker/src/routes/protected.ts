import { Hono } from 'hono'

import type { AppBindings } from '@/dto'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'

export const protectedRoutes = new Hono<AppBindings>()

protectedRoutes.use('/protected/*', authMiddleware)

protectedRoutes.get('/protected/ping', (ctx) => {
  const currentUser = ctx.get('currentUser')

  return success(ctx, {
    ok: true,
    user: {
      id: currentUser.id,
      email: currentUser.email,
      provider: currentUser.provider,
    },
  })
})
