import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

vi.mock('@/lib/reference-data/labels', () => ({
  getCategoryLabel: (key: string) => `category.${key}`,
}))

import type { ReferenceCategoryDTO } from '@/types/reference-data'
import { localDateToTimestamp } from '@/utils/datetime/helpers'

import {
  buildExpenseFeedActiveFilterLabels,
  buildExpenseFeedFilters,
  buildExpenseTimelineGroups,
  DEFAULT_EXPENSE_FEED_FILTER_VALUES,
  getExpenseFeedCategories,
  mergeExpenseFeedGroups,
} from './expense-feed-page-helpers'

describe('expense feed page helpers', () => {
  it('keeps only expense categories for the feed filters', () => {
    const categories: ReferenceCategoryDTO[] = [
      { key: 'food', kind: 'expense', iconUrl: '', color: '#000000' },
      { key: 'money-in', kind: 'income', iconUrl: '', color: '#ffffff' },
    ]

    expect(getExpenseFeedCategories(categories)).toEqual([categories[0]])
  })

  it('deduplicates personal and household groups by id', () => {
    const sharedGroup = {
      id: 'group-shared',
      name: 'Trip',
      description: null,
      status: 'active' as const,
      startDate: null,
      endDate: null,
      eventBudgetMinor: null,
      totalSpendMinor: 0,
      householdId: null,
      createdByUserId: 'user-1',
      createdAt: 1,
      updatedAt: 1,
    }

    expect(
      mergeExpenseFeedGroups(
        [sharedGroup],
        [
          {
            ...sharedGroup,
            name: 'Trip household copy',
          },
        ],
      ),
    ).toEqual([
      {
        ...sharedGroup,
        name: 'Trip household copy',
      },
    ])
  })

  it('builds API filters from page filter values', () => {
    expect(
      buildExpenseFeedFilters({
        values: {
          ...DEFAULT_EXPENSE_FEED_FILTER_VALUES,
          amountMin: '12',
          amountMax: '20',
          categoryKey: 'food',
          dateFrom: '2026-05-20',
          dateTo: '2026-05-21',
          groupId: 'group-1',
          householdId: 'household-1',
        },
        debouncedAmountMin: '12',
        debouncedAmountMax: '20',
      }),
    ).toEqual({
      amount_max: 20,
      amount_min: 12,
      category_key: 'food',
      date_from: localDateToTimestamp('2026-05-20'),
      date_to: localDateToTimestamp('2026-05-21') + 86399999,
      group_id: 'group-1',
      household_id: 'household-1',
      sort: 'occurred_at_desc',
    })
  })

  it('builds translated active filter labels from selected values', () => {
    expect(
      buildExpenseFeedActiveFilterLabels({
        values: {
          ...DEFAULT_EXPENSE_FEED_FILTER_VALUES,
          amountMin: '12',
          dateFrom: '2026-05-20',
          groupId: 'group-1',
          householdId: 'household-1',
          sort: 'amount_desc',
        },
        groups: [
          {
            id: 'group-1',
            name: 'Weekend trip',
            description: null,
            status: 'active',
            startDate: null,
            endDate: null,
            eventBudgetMinor: null,
            totalSpendMinor: 0,
            householdId: null,
            createdByUserId: 'user-1',
            createdAt: 1,
            updatedAt: 1,
          },
        ],
        households: [{ id: 'household-1', name: 'My Household' }],
        selectedCategory: {
          key: 'food',
          kind: 'expense',
          iconUrl: '',
          color: '#000000',
        },
      }),
    ).toEqual([
      'My Household',
      'category.food',
      'expense.feed.filters.sortHighestAmount',
      'expense.feed.filters.dateFrom: 2026-05-20',
      'expense.feed.filters.amountMin: 12',
      'Weekend trip',
    ])
  })

  it('groups expenses into timeline sections by local day', () => {
    expect(
      buildExpenseTimelineGroups([
        {
          id: 'expense-1',
          amountMinor: 10_000,
          currencyCode: 'VND',
          categoryKey: 'food',
          sourceKey: 'cash',
          title: 'Breakfast',
          occurredAt: Math.floor(new Date().getTime() / 1000),
          note: null,
          householdId: null,
          spentByUserId: 'user-1',
          groupIds: [],
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: 'expense-2',
          amountMinor: 20_000,
          currencyCode: 'VND',
          categoryKey: 'food',
          sourceKey: 'cash',
          title: 'Lunch',
          occurredAt: Math.floor(new Date().getTime() / 1000),
          note: null,
          householdId: 'household-1',
          spentByUserId: 'user-1',
          groupIds: [],
          createdAt: 1,
          updatedAt: 1,
        },
      ]),
    ).toEqual([
      {
        label: expect.any(String),
        items: [
          expect.objectContaining({ id: 'expense-1' }),
          expect.objectContaining({ id: 'expense-2' }),
        ],
      },
    ])
  })
})
