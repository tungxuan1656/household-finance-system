import type { MiddlewareHandler } from 'hono'

import type { AppBindings } from '@/dto'
import { newId } from '@/utils/shared/id'

export const requestContextMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const headerRequestId = ctx.req.header('x-request-id')
  const requestId =
    headerRequestId && headerRequestId.length > 0 ? headerRequestId : newId()

  ctx.set('requestId', requestId)

  await next()
}
