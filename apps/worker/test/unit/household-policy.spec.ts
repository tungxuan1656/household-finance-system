import { describe, expect, it } from 'vitest'

import {
  canCreateExpense,
  canDeleteHousehold,
  canEditAnyExpense,
  canEditOwnExpense,
  canInviteMembers,
  canManageGroups,
  canManageHouseholdSettings,
  canManageMembers,
  canViewAuditLogs,
  hasHouseholdPermission,
} from '@/lib/permissions/household-policy'

describe('household permission policy', () => {
  it('grants admin-only permissions to admins', () => {
    expect(canManageHouseholdSettings('admin')).toBe(true)
    expect(canDeleteHousehold('admin')).toBe(true)
    expect(canManageMembers('admin')).toBe(true)
    expect(canInviteMembers('admin')).toBe(true)
    expect(canManageGroups('admin')).toBe(true)
    expect(canEditAnyExpense('admin')).toBe(true)
    expect(canViewAuditLogs('admin')).toBe(true)
  })

  it('restricts admin-only permissions for members', () => {
    expect(canManageHouseholdSettings('member')).toBe(false)
    expect(canDeleteHousehold('member')).toBe(false)
    expect(canManageMembers('member')).toBe(false)
    expect(canInviteMembers('member')).toBe(false)
    expect(canManageGroups('member')).toBe(false)
    expect(canEditAnyExpense('member')).toBe(false)
    expect(canViewAuditLogs('member')).toBe(false)
  })

  it('keeps core expense creation and own-edit permissions for members', () => {
    expect(canCreateExpense('member')).toBe(true)
    expect(canEditOwnExpense('member')).toBe(true)
  })

  it('resolves permissions through hasHouseholdPermission helper', () => {
    expect(hasHouseholdPermission('admin', 'manageMembers')).toBe(true)
    expect(hasHouseholdPermission('member', 'manageMembers')).toBe(false)
    expect(hasHouseholdPermission('member', 'createExpense')).toBe(true)
    expect(hasHouseholdPermission('member', 'editOwnExpense')).toBe(true)
  })
})
