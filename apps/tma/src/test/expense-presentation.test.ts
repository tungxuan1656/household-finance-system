import { describe, expect, it } from 'vitest'

import {
  buildHouseholdNameMap,
  getSourceLabel,
} from '@/features/expenses/presentation'

const t = (key: string): string => {
  const map: Record<string, string> = {
    'expenseSource.cash': 'Tiền mặt',
    'expenseSource.bankTransfer': 'Chuyển khoản',
    'expenseSource.other': 'Khác',
  }

  return map[key] ?? key
}

describe('expense presentation helpers', () => {
  it('maps source keys to localized labels with a safe fallback', () => {
    expect(getSourceLabel('cash', t)).toBe('Tiền mặt')
    expect(getSourceLabel('bank-transfer', t)).toBe('Chuyển khoản')
    expect(getSourceLabel('unknown', t)).toBe('Khác')
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
