import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

const EXPECTED_CACHE_CONTROL =
  'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=2592000, immutable'
// CORS middleware may append `Origin` to Vary; we only need to ensure
// compression variants are not co-mingled.
const expectVaryIncludesAcceptEncoding = (response: Response): void => {
  const vary = (response.headers.get('vary') ?? '').toLowerCase()
  expect(vary.split(',').map((part) => part.trim())).toContain(
    'accept-encoding',
  )
}

const EXPECTED_CATEGORY_KEYS_IN_ORDER = [
  'food',
  'transport',
  'dating',
  'living-costs',
  'family',
  'children',
  'relatives',
  'shopping',
  'beauty',
  'health',
  'social',
  'repairs',
  'work',
  'education',
  'investment',
  'self-development',
  'sports',
  'travel',
  'hobbies',
  'pets',
  'money-in',
  'lending',
  'charity',
  'other',
] as const

registerWorkerIntegrationSetup()

describe('Worker integration: reference data', () => {
  it('returns unauthenticated static categories payload with strong cache + ETag', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/categories')
    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{
          key: string
          kind: string
          iconUrl: string
          color: string
        }>
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe(EXPECTED_CACHE_CONTROL)
    expectVaryIncludesAcceptEncoding(response)
    expect(response.headers.get('etag')).toMatch(/^"[0-9a-f]{32}"$/)
    expect(payload.success).toBe(true)
    expect(payload.error).toBeNull()
    expect(payload.meta.requestId.length).toBeGreaterThan(0)

    expect(payload.data.items).toHaveLength(24)
    expect(payload.data.items.map((item) => item.key)).toEqual(
      EXPECTED_CATEGORY_KEYS_IN_ORDER,
    )

    expect(Object.keys(payload.data.items[0]).sort()).toEqual([
      'color',
      'iconUrl',
      'key',
      'kind',
    ])
  })

  it('returns 304 when If-None-Match matches the categories ETag', async () => {
    const first = await SELF.fetch('https://example.com/api/v1/categories')
    const etag = first.headers.get('etag')
    expect(etag).not.toBeNull()

    const second = await SELF.fetch('https://example.com/api/v1/categories', {
      headers: { 'if-none-match': etag as string },
    })

    expect(second.status).toBe(304)
    expect(second.headers.get('cache-control')).toBe(EXPECTED_CACHE_CONTROL)
    expect(second.headers.get('etag')).toBe(etag)
  })

  it('returns unauthenticated static sources payload with strong cache + ETag', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/sources')
    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{ key: string }>
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe(EXPECTED_CACHE_CONTROL)
    expectVaryIncludesAcceptEncoding(response)
    expect(response.headers.get('etag')).toMatch(/^"[0-9a-f]{32}"$/)
    expect(payload.success).toBe(true)
    expect(payload.error).toBeNull()

    expect(payload.data.items).toEqual([
      { key: 'cash' },
      { key: 'bank-transfer' },
      { key: 'card' },
      { key: 'momo' },
      { key: 'zalo-pay' },
      { key: 'shopee-pay' },
      { key: 'other' },
    ])
  })

  it('returns 304 when If-None-Match matches the sources ETag', async () => {
    const first = await SELF.fetch('https://example.com/api/v1/sources')
    const etag = first.headers.get('etag')
    expect(etag).not.toBeNull()

    const second = await SELF.fetch('https://example.com/api/v1/sources', {
      headers: { 'if-none-match': etag as string },
    })

    expect(second.status).toBe(304)
    expect(second.headers.get('cache-control')).toBe(EXPECTED_CACHE_CONTROL)
    expect(second.headers.get('etag')).toBe(etag)
  })

  it('categories and sources share the same ETag (derived from combined catalog)', async () => {
    const [categories, sources] = await Promise.all([
      SELF.fetch('https://example.com/api/v1/categories'),
      SELF.fetch('https://example.com/api/v1/sources'),
    ])

    expect(categories.headers.get('etag')).toBe(sources.headers.get('etag'))
  })
})
