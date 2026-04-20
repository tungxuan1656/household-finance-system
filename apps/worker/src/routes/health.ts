import { Hono } from 'hono'

import type { AppBindings } from '@/dto'
import { success } from '@/lib/response'

export const healthRoutes = new Hono<AppBindings>()

healthRoutes.get('/health', (ctx) =>
  success(ctx, {
    service: 'fos-worker',
    ok: true,
    timestamp: new Date().toISOString(),
  }),
)
