import { Hono } from 'hono'

import type { ListCategoriesResponse, ListSourcesResponse } from '@/contracts'
import { listCategories } from '@/handlers/reference-data/list-categories'
import { listSources } from '@/handlers/reference-data/list-sources'
import { success } from '@/lib/response'
import type { AppBindings } from '@/types'

export const REFERENCE_DATA_CACHE_CONTROL =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'

export const referenceDataRoutes = new Hono<AppBindings>()

referenceDataRoutes.get('/categories', (ctx) => {
  ctx.header('Cache-Control', REFERENCE_DATA_CACHE_CONTROL)

  return success<ListCategoriesResponse>(ctx, listCategories())
})

referenceDataRoutes.get('/sources', (ctx) => {
  ctx.header('Cache-Control', REFERENCE_DATA_CACHE_CONTROL)

  return success<ListSourcesResponse>(ctx, listSources())
})
