import { describe, expect, it } from 'vitest'

import {
  formatMemberCountLabel,
  getHouseholdAvatarFallback,
  getHouseholdRoleLabel,
} from '@/features/households/presentation'

const t = (key: string, options?: Record<string, unknown>): string => {
  const map: Record<string, string> = {
    'households.memberCountOne': '1 thành viên',
    'households.memberCountMany': '{{count}} thành viên',
    'households.roleAdmin': 'Quản trị',
    'households.roleMember': 'Thành viên',
  }
  let result = map[key] ?? key
  if (options) {
    for (const [k, v] of Object.entries(options)) {
      result = result.replace(`{{${k}}}`, String(v))
    }
  }

  return result
}

describe('household presentation helpers', () => {
  it('derives a stable avatar fallback from the household name', () => {
    expect(getHouseholdAvatarFallback('Gia đình Phùng Thịnh')).toBe('GĐ')
    expect(getHouseholdAvatarFallback('City Loft')).toBe('CL')
  })

  it('formats member-count labels for singular and plural cases', () => {
    expect(formatMemberCountLabel(1, t)).toBe('1 thành viên')
    expect(formatMemberCountLabel(4, t)).toBe('4 thành viên')
  })

  it('maps household roles into TMA labels', () => {
    expect(getHouseholdRoleLabel('admin', t)).toBe('Quản trị')
    expect(getHouseholdRoleLabel('member', t)).toBe('Thành viên')
  })
})
