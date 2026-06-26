import { describe, expect, it } from 'vitest'

import {
  CATEGORY_LABELS,
  buildProgressBar,
  formatMinorAmount,
  getCategoryLabel,
  renderBudgetLine,
  renderBudgetStatusText,
  renderExpensePreviewText,
  renderExpenseSummaryLine,
  renderRecentsText,
  renderStatsText,
  renderTopCategoriesText,
} from '@/bot/format'
import { formatPeriodLabel, getCurrentPeriod } from '@/lib/period'

describe('format', () => {
  describe('buildProgressBar', () => {
    it('renders full bar at 100%', () => {
      expect(buildProgressBar(100, 8)).toBe('▓▓▓▓▓▓▓▓')
    })

    it('renders empty bar at 0%', () => {
      expect(buildProgressBar(0, 8)).toBe('░░░░░░░░')
    })

    it('renders half-filled bar at 50%', () => {
      expect(buildProgressBar(50, 8)).toBe('▓▓▓▓░░░░')
    })

    it('clamps values above 100', () => {
      expect(buildProgressBar(200, 4)).toBe('▓▓▓▓')
    })

    it('clamps values below 0', () => {
      expect(buildProgressBar(-10, 4)).toBe('░░░░')
    })

    it('defaults to 10 width', () => {
      const bar = buildProgressBar(50)
      expect(bar.length).toBe(10)
    })
  })

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
      const result = renderStatsText({
        totalSpendMinor: 15000000,
        expenseCount: 3,
        currencyCode: 'VND',
        scopeLabel: 'cá nhân',
        periodLabel: 'Tháng 6/2026',
      })

      expect(result).toContain('cá nhân')
      expect(result).toContain('Tháng 6/2026')
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

      const result = renderTopCategoriesText({
        categories,
        scopeLabel: 'cá nhân',
        periodLabel: 'Tháng 6/2026',
      })

      expect(result).toContain('Top danh mục')
      expect(result).toContain('Ăn uống')
      expect(result).toContain('Di chuyển')
      expect(result).toContain('50%')
      expect(result).toContain('25%')
      // Progress bar character (full block ▓)
      expect(result).toContain('▓')
    })

    it('renders empty state when no categories', () => {
      const result = renderTopCategoriesText({
        categories: [],
        scopeLabel: 'cá nhân',
        periodLabel: 'Tháng 6/2026',
      })

      expect(result).toContain('Chưa có chi tiêu')
    })
  })

  describe('renderBudgetLine', () => {
    it('renders OK status in green', () => {
      const result = renderBudgetLine({
        name: 'Ngân sách cá nhân',
        totalPlannedMinor: 1000000,
        totalActualMinor: 200000,
        currencyCode: 'VND',
        status: 'ok',
      })

      expect(result).toContain('🟢')
      expect(result).toContain('Ngân sách cá nhân')
      expect(result).toContain('1.000.000')
      expect(result).toContain('200.000')
      expect(result).toContain('Đã dùng 20%')
    })

    it('renders warning status in yellow', () => {
      const result = renderBudgetLine({
        name: 'Test',
        totalPlannedMinor: 1000000,
        totalActualMinor: 850000,
        currencyCode: 'VND',
        status: 'warning',
      })

      expect(result).toContain('🟡')
      expect(result).toContain('Đã dùng 85%')
    })

    it('renders exceeded status in red', () => {
      const result = renderBudgetLine({
        name: 'Test',
        totalPlannedMinor: 1000000,
        totalActualMinor: 1200000,
        currencyCode: 'VND',
        status: 'exceeded',
      })

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
    it('does not render source label', () => {
      const result = renderExpensePreviewText({
        amountMinor: 1000000,
        occurredAt: '2026-06-20',
        categoryKey: 'food',
        title: 'ăn trưa',
        sourceKey: 'cash',
        scope: 'personal',
        currencyCode: 'VND',
      })
      expect(result).not.toContain('Tiền mặt')
      expect(result).not.toContain('cash')
    })

    it('renders personal scope preview', () => {
      const result = renderExpensePreviewText({
        amountMinor: 3000000,
        occurredAt: '2026-06-15',
        categoryKey: 'food',
        title: 'ăn bún',
        sourceKey: 'bank-transfer',
        scope: 'personal',
        currencyCode: 'VND',
      })

      expect(result).toContain('3.000.000')
      expect(result).toContain('VND')
      expect(result).toContain('Ăn uống')
      expect(result).toContain('2026-06-15')
      expect(result).toContain('ăn bún')
      expect(result).toContain('Cá nhân')
    })

    it('renders household scope preview', () => {
      const result = renderExpensePreviewText({
        amountMinor: 5000000,
        occurredAt: '2026-06-20',
        categoryKey: 'transport',
        title: 'xe ôm',
        sourceKey: 'cash',
        scope: 'household',
        householdId: 'hh-1',
        householdName: 'Gia đình Test',
        currencyCode: 'VND',
      })

      expect(result).toContain('Gia đình Test')
    })
  })

  describe('renderRecentsText', () => {
    it('renders empty state text', () => {
      const result = renderRecentsText({ expenses: [] })

      expect(result).toContain('Chưa có chi tiêu nào')
    })

    it('renders header and summary lines for populated list', () => {
      const result = renderRecentsText({
        expenses: [
          {
            amountMinor: 5000000,
            occurredAt: '2026-06-24',
            categoryKey: 'transport',
            title: 'đổ xăng',
            currencyCode: 'VND',
          },
        ],
      })

      expect(result).toContain('Chi tiêu gần đây')
      expect(result).toMatch(
        /🛵 Di chuyển · đổ xăng · <code>5\.000\.000₫<\/code> · 24\/06/,
      )
    })
  })

  describe('renderExpenseSummaryLine', () => {
    it('renders emoji + category label · title · amount₫ · dd/MM', () => {
      const result = renderExpenseSummaryLine({
        amountMinor: 5000000,
        occurredAt: '2026-06-24',
        categoryKey: 'transport',
        title: 'đổ xăng',
        sourceKey: 'cash',
        scope: 'personal',
        currencyCode: 'VND',
      })

      // Pin full shape: emoji + label · title · code(amount₫) · dd/MM.
      // Catches regressions like label/title swap, missing separator,
      // or wrong date format.
      expect(result).toMatch(
        /^🛵 Di chuyển · đổ xăng · <code>5\.000\.000₫<\/code> · 24\/06$/,
      )
    })

    it('falls back to raw date when not in YYYY-MM-DD shape', () => {
      const result = renderExpenseSummaryLine({
        amountMinor: 100,
        occurredAt: 'today',
        categoryKey: 'food',
        title: 'ăn sáng',
        sourceKey: 'cash',
        scope: 'personal',
        currencyCode: 'VND',
      })

      expect(result).toContain('ăn sáng')
      expect(result).toContain('today')
      expect(result).not.toContain('undefined')
    })
  })
})
