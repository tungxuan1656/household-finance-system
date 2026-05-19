'use client'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

import {
  buildAddExpenseInitialState,
  buildAddExpensePayload,
  validateAddExpenseForm,
} from '@/components/expense/use-add-expense-form'

describe('use-add-expense-form helpers', () => {
  it('builds initial state with last source fallback and provided current date', () => {
    expect(buildAddExpenseInitialState('momo', 1746662400000)).toEqual({
      amountInput: '',
      categoryKey: null,
      sourceKey: 'momo',
      title: '',
      occurredOn: '2025-05-08',
      householdId: '',
      groupId: '',
    })

    expect(buildAddExpenseInitialState(null, 1746662400000).sourceKey).toBe(
      'cash',
    )
  })

  it('returns required field errors for incomplete input', () => {
    expect(
      validateAddExpenseForm({
        amountInput: '',
        categoryKey: null,
        sourceKey: '',
        title: '   ',
        occurredOn: '',
        householdId: '',
        groupId: '',
      }),
    ).toEqual({
      amountInput: 'expense.error.amountRequired',
      categoryKey: 'expense.error.categoryRequired',
      sourceKey: 'expense.error.sourceRequired',
      title: 'expense.error.titleRequired',
      occurredOn: 'expense.error.dateRequired',
    })
  })

  it('returns no errors for complete valid input', () => {
    expect(
      validateAddExpenseForm({
        amountInput: '3',
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredOn: '2026-05-19',
        householdId: '',
        groupId: '',
      }),
    ).toEqual({})
  })

  it('builds a private payload with trimmed title and no optional ids', () => {
    expect(
      buildAddExpensePayload({
        amountInput: '3',
        categoryKey: 'food',
        sourceKey: 'cash',
        title: '  Lunch  ',
        occurredOn: '2026-05-19',
        householdId: '',
        groupId: '',
      }),
    ).toEqual({
      amount: 3000,
      categoryKey: 'food',
      sourceKey: 'cash',
      title: 'Lunch',
      occurredAt: expect.any(Number),
      visibility: 'private',
    })
  })

  it('builds a household payload with group ids when selected', () => {
    expect(
      buildAddExpensePayload({
        amountInput: '250',
        categoryKey: 'living-costs',
        sourceKey: 'bank-transfer',
        title: 'Electricity',
        occurredOn: '2026-05-19',
        householdId: 'house-1',
        groupId: 'group-1',
      }),
    ).toEqual({
      amount: 250000,
      categoryKey: 'living-costs',
      sourceKey: 'bank-transfer',
      title: 'Electricity',
      occurredAt: expect.any(Number),
      visibility: 'household',
      householdId: 'house-1',
      groupIds: ['group-1'],
    })
  })

  it('returns null when payload-critical values cannot be parsed', () => {
    expect(
      buildAddExpensePayload({
        amountInput: '',
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredOn: 'invalid',
        householdId: '',
        groupId: '',
      }),
    ).toBeNull()
  })
})
