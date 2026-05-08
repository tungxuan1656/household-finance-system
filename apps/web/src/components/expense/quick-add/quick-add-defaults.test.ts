import { describe, expect, it, vi } from 'vitest'

import { ApiClientError } from '@/api/client'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

import {
  buildQuickAddInitialValues,
  buildQuickAddSubmitError,
  getQuickAddDefaultCategory,
} from '@/components/expense/quick-add/quick-add-defaults'

describe('quick-add-defaults', () => {
  it('builds initial values from profile source and matching recent expense', () => {
    const values = buildQuickAddInitialValues({
      profile: {
        id: 'user-1',
        displayName: 'Owner',
        email: 'owner@example.com',
        avatarUrl: null,
        quickAddLastSourceKey: 'bank-transfer',
        createdAt: 1,
      },
      recentExpenses: [
        {
          id: 'expense-1',
          amountMinor: 10000,
          categoryKey: 'food',
          createdAt: 10,
          createdByUserId: 'user-1',
          currencyCode: 'VND',
          householdId: null,
          note: null,
          occurredAt: 10,
          payerUserId: null,
          sourceKey: 'bank-transfer',
          title: 'Lunch',
          updatedAt: 10,
          visibility: 'private',
        },
      ],
    })

    expect(values).toMatchObject({
      sourceKey: 'bank-transfer',
      categoryKey: 'food',
      visibility: 'private',
    })

    expect(values.occurredAt).toEqual(expect.any(Number))
  })

  it('prefers matching household category before fallback', () => {
    const categoryKey = getQuickAddDefaultCategory({
      recentExpenses: [
        {
          id: 'expense-1',
          amountMinor: 10000,
          categoryKey: 'transport',
          createdAt: 10,
          createdByUserId: 'user-1',
          currencyCode: 'VND',
          householdId: 'household-2',
          note: null,
          occurredAt: 10,
          payerUserId: null,
          sourceKey: 'cash',
          title: 'Taxi',
          updatedAt: 10,
          visibility: 'household',
        },
        {
          id: 'expense-2',
          amountMinor: 20000,
          categoryKey: 'food',
          createdAt: 20,
          createdByUserId: 'user-1',
          currencyCode: 'VND',
          householdId: 'household-1',
          note: null,
          occurredAt: 20,
          payerUserId: null,
          sourceKey: 'cash',
          title: 'Dinner',
          updatedAt: 20,
          visibility: 'household',
        },
      ],
      sourceKey: 'cash',
      visibility: 'household',
      householdId: 'household-1',
    })

    expect(categoryKey).toBe('food')
  })

  it('builds permission retry error for forbidden API response', () => {
    expect(
      buildQuickAddSubmitError(
        new ApiClientError({
          code: 'FORBIDDEN',
          message: 'Forbidden',
          status: 403,
        }),
      ),
    ).toEqual({
      kind: 'permission',
      message: 'expense.quickAdd.permissionError',
      hint: 'expense.quickAdd.retryHint',
    })
  })
})
