import { describe, expect, it } from 'vitest'

import {
  CATEGORY_LABELS,
  formatMinorAmount,
  formatPeriodLabel,
  getCategoryLabel,
  getCurrentPeriod,
  renderBudgetLine,
  renderBudgetStatusText,
  renderConfirmSuccessText,
  renderExpensePreviewText,
  renderStatsText,
  renderTopCategoriesText,
} from '@/bot/renderers/finance-text'

describe('finance-text', () => {
  describe('getCategoryLabel', () => {
    it('returns Vietnamese label for known key', () => {
      expect(getCategoryLabel('food')).toBe('Ăn uống')
      expect(getCategoryLabel('transport')).toBe('Di chuyển')
      expect(getCategoryLabel('health')).toBe('Sức khỏe')
    })

    it('returns key as fallback for unknown key', () => {
      expect(getCategoryLabel('unknown-cat')).toBe('unknown-cat')
    })
  })

  describe('formatMinorAmount', () => {
    it('formats VND (0 decimals)', () => {
      expect(formatMinorAmount(30000, 'VND')).toBe('30.000')
    })

    it('formats a larger VND amount', () => {
      expect(formatMinorAmount(15000000, 'VND')).toBe('15.000.000')
    })

    it('formats zero', () => {
      expect(formatMinorAmount(0, 'VND')).toBe('0')
    })

    it('formats USD (2 decimals)', () => {
      expect(formatMinorAmount(12345, 'USD')).toBe('123,45')
    })

    it('formats JPY (0 decimals)', () => {
      expect(formatMinorAmount(500, 'JPY')).toBe('500')
    })

    it('formats KWD (3 decimals)', () => {
      expect(formatMinorAmount(12345, 'KWD')).toBe('12,345')
    })
  })

  describe('formatPeriodLabel', () => {
    it('formats YYYY-MM to Vietnamese label', () => {
      expect(formatPeriodLabel('2026-06')).toBe('Tháng 6/2026')
    })
  })

  describe('getCurrentPeriod', () => {
    it('returns a YYYY-MM string', () => {
      const period = getCurrentPeriod()

      expect(period).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
    })
  })

  describe('renderStatsText', () => {
    it('renders stats text with amount and count', () => {
      const result = renderStatsText(
        15000000,
        3,
        'VND',
        'cá nhân',
        'Tháng 6/2026',
      )

      expect(result).toContain('Thống kê')
      expect(result).toContain('cá nhân')
      expect(result).toContain('15.000.000')
      expect(result).toContain('VND')
      expect(result).toContain('3 khoản')
    })
  })

  describe('renderTopCategoriesText', () => {
    it('renders top categories list', () => {
      const categories = [
        { categoryKey: 'food', totalSpendMinor: 100000, percentOfTotal: 50 },
        {
          categoryKey: 'transport',
          totalSpendMinor: 50000,
          percentOfTotal: 25,
        },
      ]

      const result = renderTopCategoriesText(
        categories,
        'cá nhân',
        'Tháng 6/2026',
      )

      expect(result).toContain('Danh mục chi tiêu')
      expect(result).toContain('1. Ăn uống')
      expect(result).toContain('2. Di chuyển')
      expect(result).toContain('50%')
      expect(result).toContain('25%')
    })

    it('renders empty state when no categories', () => {
      const result = renderTopCategoriesText([], 'cá nhân', 'Tháng 6/2026')

      expect(result).toContain('Chưa có chi tiêu')
    })
  })

  describe('renderBudgetLine', () => {
    it('renders OK status in green', () => {
      const result = renderBudgetLine(
        'Ngân sách cá nhân',
        1000000,
        200000,
        'VND',
        'ok',
      )

      expect(result).toContain('🟢')
      expect(result).toContain('Ngân sách cá nhân')
      expect(result).toContain('1.000.000')
      expect(result).toContain('Đã dùng 20%')
    })

    it('renders warning status in yellow', () => {
      const result = renderBudgetLine('Test', 1000000, 850000, 'VND', 'warning')

      expect(result).toContain('🟡')
      expect(result).toContain('Đã dùng 85%')
    })

    it('renders exceeded status in red', () => {
      const result = renderBudgetLine(
        'Test',
        1000000,
        1200000,
        'VND',
        'exceeded',
      )

      expect(result).toContain('🔴')
      expect(result).toContain('Đã vượt 120%')
    })
  })

  describe('renderBudgetStatusText', () => {
    it('renders multiple budget lines', () => {
      const lines = ['🟢 Budget 1', '🔴 Budget 2']
      const result = renderBudgetStatusText(lines)

      expect(result).toContain('Ngân sách')
      expect(result).toContain('Budget 1')
      expect(result).toContain('Budget 2')
    })

    it('renders empty state', () => {
      const result = renderBudgetStatusText([])

      expect(result).toContain('Chưa có ngân sách')
    })
  })

  describe('renderExpensePreviewText', () => {
    it('renders personal scope preview', () => {
      const result = renderExpensePreviewText(
        {
          amountMinor: 3000000, // 30k VND
          occurredAt: '2026-06-15',
          categoryKey: 'food',
          title: 'ăn bún',
          sourceKey: 'bank-transfer',
          scope: 'personal',
        },
        'VND',
      )

      expect(result).toContain('Xem trước chi tiêu')
      expect(result).toContain('3.000.000')
      expect(result).toContain('VND')
      expect(result).toContain('Ăn uống')
      expect(result).toContain('2026-06-15')
      expect(result).toContain('ăn bún')
      expect(result).toContain('Cá nhân')
    })

    it('renders household scope preview', () => {
      const result = renderExpensePreviewText(
        {
          amountMinor: 5000000, // 50k VND
          occurredAt: '2026-06-20',
          categoryKey: 'transport',
          title: 'xe ôm',
          sourceKey: 'cash',
          scope: 'household',
          householdId: 'hh-1',
          householdName: 'Gia đình Test',
        },
        'VND',
      )

      expect(result).toContain('Gia đình Test')
    })
  })

  describe('renderConfirmSuccessText', () => {
    it('renders success message', () => {
      const result = renderConfirmSuccessText(
        {
          amountMinor: 3000000, // 30k VND
          occurredAt: '2026-06-15',
          categoryKey: 'food',
          title: 'ăn bún',
          sourceKey: 'bank-transfer',
          scope: 'personal',
        },
        'VND',
      )

      expect(result).toContain('Đã thêm chi tiêu thành công')
      expect(result).toContain('3.000.000')
      expect(result).toContain('Ăn uống')
      expect(result).toContain('ăn bún')
    })
  })
})
