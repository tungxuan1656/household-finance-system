import { describe, expect, it } from 'vitest'

import {
  formatMemberCountLabel,
  getHouseholdAvatarFallback,
  getHouseholdRoleLabel,
} from '@/features/households/presentation'

describe('household presentation helpers', () => {
  it('derives a stable avatar fallback from the household name', () => {
    expect(getHouseholdAvatarFallback('Gia đình Phùng Thịnh')).toBe('GĐ')
    expect(getHouseholdAvatarFallback('City Loft')).toBe('CL')
  })

  it('formats member-count labels for singular and plural cases', () => {
    expect(formatMemberCountLabel(1)).toBe('1 thành viên')
    expect(formatMemberCountLabel(4)).toBe('4 thành viên')
  })

  it('maps household roles into TMA labels', () => {
    expect(getHouseholdRoleLabel('admin')).toBe('Quản trị')
    expect(getHouseholdRoleLabel('member')).toBe('Thành viên')
  })
})
