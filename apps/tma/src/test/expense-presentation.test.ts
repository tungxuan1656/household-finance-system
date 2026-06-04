import { describe, expect, it } from 'vitest'

import {
  buildHouseholdNameMap,
  getSourceLabel,
} from '@/features/expenses/presentation'

describe('expense presentation helpers', () => {
  it('maps source keys to localized labels with a safe fallback', () => {
    expect(getSourceLabel('cash')).toBe('Tiền mặt')
    expect(getSourceLabel('bank-transfer')).toBe('Chuyển khoản')
    expect(getSourceLabel('unknown')).toBe('Khác')
  })

  it('builds a stable household name lookup map', () => {
    const householdNameMap = buildHouseholdNameMap([
      {
        avatarUrl: null,
        createdAt: 0,
        defaultCurrencyCode: 'VND',
        id: 'household-1',
        name: 'Gia đình 1',
        role: 'admin',
        slug: 'gia-dinh-1',
        timezone: 'Asia/Ho_Chi_Minh',
      },
      {
        avatarUrl: null,
        createdAt: 0,
        defaultCurrencyCode: 'USD',
        id: 'household-2',
        name: 'City Loft',
        role: 'member',
        slug: 'city-loft',
        timezone: 'America/New_York',
      },
    ])

    expect(householdNameMap.get('household-1')).toBe('Gia đình 1')
    expect(householdNameMap.get('household-2')).toBe('City Loft')
    expect(householdNameMap.get('missing')).toBeUndefined()
  })
})
