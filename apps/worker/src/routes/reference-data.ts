import { type Context, Hono } from 'hono'

import type { ListCategoriesResponse, ListSourcesResponse } from '@/contracts'
import { listCategories } from '@/handlers/reference-data/list-categories'
import { listSources } from '@/handlers/reference-data/list-sources'
import {
  listReferenceCategories,
  listReferenceSources,
} from '@/lib/reference-data/catalog'
import { success } from '@/lib/response'
import type { AppBindings } from '@/types'

// Catalog data is hardcoded at build time and almost never changes.
// Cache aggressively: client `immutable` for 1y + CDN `s-maxage` for 1y + SWR for 30d
// as a safety net. Strong ETag (SHA-256 of catalog payload) lets clients revalidate
// cheaply when a new deployment ships updated icons/colors.
export const REFERENCE_DATA_CACHE_CONTROL =
  'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=2592000, immutable'

const REFERENCE_DATA_VARY = 'Accept-Encoding'

// Build a strong ETag once per worker instance from the canonical catalog payload.
// When the catalog source changes (new deploy), the hash changes and the ETag
// rotates automatically, busting immutable caches safely.
let cachedEtag: string | null = null
const buildCatalogEtag = async (): Promise<string> => {
  if (cachedEtag) return cachedEtag

  const payload = JSON.stringify({
    categories: listReferenceCategories(),
    sources: listReferenceSources(),
  })
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(payload),
  )
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  cachedEtag = `"${hex.slice(0, 32)}"`

  return cachedEtag
}

const stampReferenceHeaders = (response: Response, etag: string): Response => {
  response.headers.set('Cache-Control', REFERENCE_DATA_CACHE_CONTROL)
  response.headers.set('Vary', REFERENCE_DATA_VARY)
  response.headers.set('ETag', etag)

  return response
}

// Best-effort write-through to the Cloudflare edge cache (caches.default).
// We clone the response first so downstream middleware (which reads `c.res`)
// can still consume the original body without hitting a disturbed stream.
const writeToEdgeCache = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const cache = caches.default
    if (!cache) return

    const cacheable = new Response(response.clone().body, response)
    cacheable.headers.set('Cache-Control', REFERENCE_DATA_CACHE_CONTROL)
    cacheable.headers.set('Vary', REFERENCE_DATA_VARY)
    await cache.put(request, cacheable)
  } catch {
    // Cache write failures must never break the request.
  }
}

// Edge caching via caches.default is only enabled outside local/test runs.
// In the vitest pool-workers environment, writes to caches.default corrupt
// the per-test isolated storage and produce "Isolated storage failed" errors.
const shouldUseEdgeCache = (ctx: Context<AppBindings>): boolean => {
  const env = ctx.env as { APP_ENV?: string }

  return env.APP_ENV === 'prod'
}

const serveReferenceData = async (
  ctx: Context<AppBindings>,
  buildBody: () => ListCategoriesResponse | ListSourcesResponse,
) => {
  const useEdgeCache = shouldUseEdgeCache(ctx)
  const cache = useEdgeCache ? caches.default : null
  const cacheKey = ctx.req.raw

  // Try the edge cache first — most production reads will hit here.
  if (cache) {
    const cached = await cache.match(cacheKey)
    if (cached) {
      const etag = cached.headers.get('etag')
      if (etag && ctx.req.header('if-none-match') === etag) {
        return new Response(null, {
          status: 304,
          headers: {
            ETag: etag,
            'Cache-Control': REFERENCE_DATA_CACHE_CONTROL,
            Vary: REFERENCE_DATA_VARY,
          },
        })
      }

      return cached
    }
  }

  const etag = await buildCatalogEtag()
  if (ctx.req.header('if-none-match') === etag) {
    const notModified = ctx.body(null, 304)
    if (notModified instanceof Response) {
      stampReferenceHeaders(notModified, etag)
    }

    return notModified
  }

  const response = success(ctx, buildBody())
  stampReferenceHeaders(response, etag)

  if (cache && response.ok) {
    ctx.executionCtx.waitUntil(writeToEdgeCache(cacheKey, response))
  }

  return response
}

export const referenceDataRoutes = new Hono<AppBindings>()

referenceDataRoutes.get('/categories', (ctx) =>
  serveReferenceData(ctx, () => listCategories() as ListCategoriesResponse),
)

referenceDataRoutes.get('/sources', (ctx) =>
  serveReferenceData(ctx, () => listSources() as ListSourcesResponse),
)
