import { beforeEach, describe, expect, it, vi } from 'vitest'

import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import {
  getReferenceCategories,
  getReferenceSources,
} from '@/api/reference-data'
import type {
  ReferenceCategoryDTO,
  ReferenceSourceDTO,
} from '@/types/reference-data'

vi.mock('@/api/client', () => ({
  client: {
    get: vi.fn(),
  },
}))

const getMock = vi.mocked(client.get)

describe('reference-data api', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('requests global categories from static endpoint', async () => {
    const categories: ReferenceCategoryDTO[] = [
      {
        key: 'food',
        kind: 'expense',
        iconUrl: 'https://example.com/icons/food.png',
        color: '#F97316',
      },
    ]

    getMock.mockResolvedValueOnce({ data: { items: categories } })

    const payload = await getReferenceCategories()

    expect(getMock).toHaveBeenCalledWith(
      API_ENDPOINTS.referenceData.categories,
      {
        skipAuth: true,
      },
    )

    expect(payload.items).toEqual(categories)
  })

  it('requests global sources from static endpoint', async () => {
    const sources: ReferenceSourceDTO[] = [{ key: 'cash' }]

    getMock.mockResolvedValueOnce({ data: { items: sources } })

    const payload = await getReferenceSources()

    expect(getMock).toHaveBeenCalledWith(API_ENDPOINTS.referenceData.sources, {
      skipAuth: true,
    })

    expect(payload.items).toEqual(sources)
  })
})
