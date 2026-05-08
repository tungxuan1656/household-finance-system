import { describe, expect, it } from 'vitest'

import {
  buildAnalyticsExportCsv,
  sanitizeCsvCell,
} from '@/db/repositories/expense-analytics-export'

describe('expense analytics export helpers', () => {
  it('sanitizes spreadsheet formulas', () => {
    expect(sanitizeCsvCell('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)")
    expect(sanitizeCsvCell('plain text')).toBe('plain text')
  })

  it('builds csv sections for analytics export', () => {
    const csv = buildAnalyticsExportCsv({
      overview: {
        period: '2026-05',
        householdId: 'household-1',
        currencyCode: 'VND',
        totalSpendMinor: 1000,
        expenseCount: 1,
        dailySpend: [{ date: '2026-05-01', totalSpendMinor: 1000 }],
        topCategories: [
          {
            categoryKey: 'food',
            totalSpendMinor: 1000,
            percentOfTotal: 100,
            expenseCount: 1,
          },
        ],
      },
      comparison: {
        householdId: 'household-1',
        currencyCode: 'VND',
        currentPeriod: {
          period: '2026-05',
          totalSpendMinor: 1000,
          expenseCount: 1,
        },
        previousPeriod: {
          period: '2026-04',
          totalSpendMinor: 500,
          expenseCount: 1,
        },
        totalDeltaSpendMinor: 500,
        totalDeltaPercent: 100,
        topCategoryDeltas: [],
        payerAttribution: [],
      },
      groups: {
        period: '2026-05',
        householdId: 'household-1',
        currencyCode: 'VND',
        totalGroupedSpendMinor: 1000,
        groups: [],
      },
      expenseRows: [
        {
          id: 'expense-1',
          occurredAt: 100,
          categoryKey: 'food',
          payerUserId: 'user-1',
          visibility: 'private',
          title: '=Lunch',
          amountMinor: 1000,
        },
      ],
    })

    expect(csv).toContain('section,period,household_id,currency_code')
    expect(csv).toContain('summary,2026-05,household-1,VND,overview_total')
    expect(csv).toContain('expense,2026-05,household-1,VND,expense_row')
    expect(csv).toContain("'=Lunch")
  })
})
