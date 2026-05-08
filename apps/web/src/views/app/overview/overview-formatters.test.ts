import { describe, expect, it, vi } from 'vitest'

import {
  formatCurrency,
  formatPeriodLabel,
  getRoleLabel,
} from '@/views/app/overview/overview-formatters'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string, params?: Record<string, string>) =>
    params ? `${key}:${params.month ?? ''}:${params.year ?? ''}` : key,
}))

describe('overview-formatters', () => {
  it('formats currency using minor units', () => {
    expect(formatCurrency(1250000, 'VND')).toContain('12.500')
  })

  it('formats period label from yyyy-mm period', () => {
    expect(formatPeriodLabel('2026-05')).toBe(
      'app.overview.summary.period:05:2026',
    )
  })

  it('returns translated role label', () => {
    expect(getRoleLabel('admin')).toBe(
      'app.householdDetail.members.invite.fields.role.options.admin',
    )
  })
})
