import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

import {
  getHouseholdRoleLabel,
  getHouseholdVisibilityLabel,
} from '@/features/households/utils/labels'

describe('household/labels', () => {
  it('maps roles to translation keys', () => {
    expect(getHouseholdRoleLabel('admin')).toBe(
      'app.householdDetail.members.invite.fields.role.options.admin',
    )

    expect(getHouseholdRoleLabel('member')).toBe(
      'app.householdDetail.members.invite.fields.role.options.member',
    )
  })

  it('maps visibility to translation keys', () => {
    expect(getHouseholdVisibilityLabel('private')).toBe(
      'app.householdDetail.fields.defaultVisibility.options.private',
    )

    expect(getHouseholdVisibilityLabel('household')).toBe(
      'app.householdDetail.fields.defaultVisibility.options.household',
    )
  })
})
