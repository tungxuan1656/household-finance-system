'use client'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

import {
  buildExpenseEntryInitialState,
  buildExpenseEntryPayload,
  buildExpenseEntryUpdatePayload,
  hydrateExpenseEntryAmountInput,
  validateExpenseEntryForm,
} from '@/components/expense/use-expense-entry-form'

describe('use-expense-entry-form helpers', () => {
  it('builds create initial state with last source fallback and current date', () => {
    expect(
      buildExpenseEntryInitialState({
        mode: 'create',
        lastSourceKey: 'momo',
        currentTime: 1746662400000,
      }),
    ).toEqual({
      amountInput: '',
      categoryKey: null,
      sourceKey: 'momo',
      title: '',
      occurredOn: '2025-05-08',
      householdId: '',
      groupId: '',
    })

    expect(
      buildExpenseEntryInitialState({
        mode: 'create',
        lastSourceKey: null,
        currentTime: 1746662400000,
      }).sourceKey,
    ).toBe('cash')
  })

  it('hydrates edit state symmetrically from stored minor amount', () => {
    expect(
      buildExpenseEntryInitialState({
        mode: 'edit',
        currentTime: 1746662400000,
        expense: {
          id: 'exp-1',
          amountMinor: 1234000,
          currencyCode: 'VND',
          categoryKey: 'food',
          sourceKey: 'cash',
          title: 'Lunch',
          occurredAt: 1746662400000,
          note: null,
          visibility: 'private',
          householdId: null,
          payerUserId: null,
          groupIds: ['group-1'],
          createdByUserId: 'user-1',
          createdAt: 1746662400000,
          updatedAt: 1746662400000,
        },
      }),
    ).toEqual({
      amountInput: '1234',
      categoryKey: 'food',
      sourceKey: 'cash',
      title: 'Lunch',
      occurredOn: '2025-05-08',
      householdId: '',
      groupId: 'group-1',
    })
  })

  it('builds edit update payload with symmetric household and group behavior', () => {
    expect(
      buildExpenseEntryUpdatePayload('exp-1', {
        amountInput: '1234',
        categoryKey: 'food',
        sourceKey: 'cash',
        title: ' Lunch ',
        occurredOn: '2026-05-19',
        householdId: '',
        groupId: 'group-1',
      }),
    ).toEqual({
      id: 'exp-1',
      payload: {
        amount: 1234000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: expect.any(Number),
        visibility: 'private',
        groupIds: ['group-1'],
      },
    })
  })

  it('returns required field errors for incomplete input', () => {
    expect(
      validateExpenseEntryForm({
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

  it('builds a private payload with trimmed title and no optional ids', () => {
    expect(
      buildExpenseEntryPayload({
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
      buildExpenseEntryPayload({
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
      buildExpenseEntryPayload({
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

  it('hydrates minor amount input symmetrically', () => {
    expect(hydrateExpenseEntryAmountInput(12000)).toBe('12')
  })
})
