import { describe, expect, it } from 'vitest'

import {
  normalizeAiItem,
  normalizeAiItemWithContext,
} from '@/bot/commands/ai-expense-shared'

describe('normalizeAiItem', () => {
  it('normalizes a valid item and trims title', () => {
    const result = normalizeAiItem(
      {
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: '  Ăn trưa  ',
        occurredAt: '2025-06-25',
      },
      '2025-06-25',
    )

    expect(result).not.toBeNull()
    expect(result?.title).toBe('Ăn trưa')
    expect(result?.amount).toBe(50000)
  })

  it('falls back to defaultOccurredAt when date is invalid', () => {
    const result = normalizeAiItem(
      {
        amount: 10000,
        categoryKey: 'food',
        title: 'cà phê',
        occurredAt: 'bad-date',
      },
      '2025-06-25',
    )

    expect(result?.occurredAt).toBe('2025-06-25')
  })

  it('returns null for invalid amount', () => {
    const result = normalizeAiItem(
      {
        amount: -5,
        categoryKey: '',
        title: '',
        occurredAt: '2025-06-25',
      },
      '2025-06-25',
    )

    expect(result).toBeNull()
  })
})

describe('normalizeAiItemWithContext', () => {
  it('maps household/group via whitelist and returns parsed', () => {
    const maps = {
      householdNameToId: new Map([['nha a', 'hh-1']]),
      groupNameToId: new Map([['nhom 1', 'g-1']]),
      groupIdToHouseholdId: new Map<string, string | null>([['g-1', 'hh-1']]),
    }

    const { parsed, householdId, groupIds } = normalizeAiItemWithContext(
      {
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Ăn trưa',
        occurredAt: '2025-06-25',
        householdName: 'Nha A',
        groupNames: ['Nhom 1'],
      } as unknown as import('@/lib/ai/expense-parser').RawAiItem,
      '2025-06-25',
      maps,
    )

    expect(parsed).not.toBeNull()
    expect(householdId).toBe('hh-1')
    expect(groupIds).toContain('g-1')
  })
})
