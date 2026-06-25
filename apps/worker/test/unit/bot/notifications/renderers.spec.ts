import { describe, expect, it } from 'vitest'

import {
  renderBudgetAlertText,
  renderHouseholdActivityText,
  renderWeeklyDigestText,
} from '@/bot/notifications/renderers'

describe('notification renderers', () => {
  describe('renderBudgetAlertText', () => {
    it('renders warning (80%)', () => {
      const result = renderBudgetAlertText({
        name: 'Ngân sách cá nhân',
        totalPlannedMinor: 10000000,
        totalActualMinor: 8500000,
        currencyCode: 'VND',
        isExceeded: false,
      })

      expect(result).toContain('🟡')
      expect(result).toContain('Sắp hết ngân sách')
      expect(result).toContain('Ngân sách cá nhân')
      expect(result).toContain('85%')
    })

    it('renders exceeded (100%)', () => {
      const result = renderBudgetAlertText({
        name: 'Ngân sách cá nhân',
        totalPlannedMinor: 10000000,
        totalActualMinor: 12000000,
        currencyCode: 'VND',
        isExceeded: true,
      })

      expect(result).toContain('🔴')
      expect(result).toContain('Vượt ngân sách')
      expect(result).toContain('120%')
    })
  })

  describe('renderHouseholdActivityText', () => {
    it('renders household activity notification', () => {
      const result = renderHouseholdActivityText({
        actorName: 'Tung',
        householdName: 'Gia đình Test',
        title: 'ăn bún',
        amountMinor: 3000000,
        categoryKey: 'food',
        occurredAt: '2026-06-15',
        currencyCode: 'VND',
      })

      expect(result).toContain('Gia đình Test')
      expect(result).toContain('Tung')
      expect(result).toContain('ăn bún')
      expect(result).toContain('3.000.000')
      expect(result).toContain('Ăn uống')
    })
  })

  describe('renderWeeklyDigestText', () => {
    it('renders weekly digest with categories and budget warnings', () => {
      const result = renderWeeklyDigestText({
        totalSpendMinor: 15000000,
        expenseCount: 5,
        topCategories: [
          {
            categoryKey: 'food',
            totalSpendMinor: 10000000,
            percentOfTotal: 67,
          },
        ],
        budgetWarnings: [
          { name: 'Ngân sách cá nhân', status: 'warning', percent: 85 },
        ],
        currencyCode: 'VND',
        periodLabel: 'Tháng 6/2026',
        deepLinkUrl: 'https://t.me/phofis_bot',
      })

      expect(result).toContain('Tuần')
      expect(result).toContain('15.000.000')
      expect(result).toContain('5 khoản')
      expect(result).toContain('Ăn uống')
      expect(result).toContain('Ngân sách cá nhân')
      expect(result).toContain('85%')
      expect(result).toContain('https://t.me/phofis_bot')
    })
  })
})
