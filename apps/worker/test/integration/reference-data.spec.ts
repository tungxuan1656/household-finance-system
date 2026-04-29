import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

const EXPECTED_CACHE_CONTROL =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'

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
  it('returns unauthenticated static categories payload with cache header', async () => {
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

  it('returns unauthenticated static sources payload with cache header', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/sources')
    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{ key: string }>
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe(EXPECTED_CACHE_CONTROL)
    expect(payload.success).toBe(true)
    expect(payload.error).toBeNull()

    expect(payload.data.items).toEqual([
      { key: 'cash' },
      { key: 'bank-transfer' },
      { key: 'card' },
      { key: 'e-wallet' },
      { key: 'other' },
    ])
  })
})
