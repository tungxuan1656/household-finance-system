import { describe, expect, it } from 'vitest'

import { getCategoryPresentation } from './category-presentation'

describe('getCategoryPresentation', () => {
  it('falls back safely when metadata is missing', () => {
    expect(getCategoryPresentation(undefined)).toEqual({
      key: 'unknown',
      label: 'Khác',
    })
  })

  it('resolves metadata when available', () => {
    expect(
      getCategoryPresentation('food', [
        { key: 'food', iconUrl: 'https://example.com/icon.svg', color: '#f00' },
      ]),
    ).toMatchObject({
      key: 'food',
      iconUrl: 'https://example.com/icon.svg',
      color: '#f00',
    })
  })
})
