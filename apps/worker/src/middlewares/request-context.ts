import type { MiddlewareHandler } from 'hono'

import { resolveLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'
import { newId } from '@/utils/id'

export const requestContextMiddleware: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const headerRequestId = ctx.req.header('x-request-id')
  const requestId =
    headerRequestId && headerRequestId.length > 0 ? headerRequestId : newId()
  const localeHeader =
    ctx.req.header('x-locale') ?? ctx.req.header('accept-language')

  ctx.set('requestId', requestId)
  ctx.set('locale', resolveLocale(localeHeader))

  await next()
}
