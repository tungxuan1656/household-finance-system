import { Hono } from 'hono'

import { success } from '@/lib/response'
import type { AppBindings } from '@/types'

export const healthRoutes = new Hono<AppBindings>()

healthRoutes.get('/health', (ctx) =>
  success(ctx, {
    service: 'household-finance-worker',
    ok: true,
    timestamp: new Date().toISOString(),
  }),
)
