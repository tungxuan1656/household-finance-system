import type { HouseholdRole } from '@/types'

export type HouseholdPermission =
  | 'manageHouseholdSettings'
  | 'deleteHousehold'
  | 'manageMembers'
  | 'inviteMembers'
  | 'manageGroups'
  | 'createExpense'
  | 'editOwnExpense'
  | 'editAnyExpense'
  | 'viewAuditLogs'

const isAdmin = (role: HouseholdRole): boolean => role === 'admin'

export const canManageHouseholdSettings = (role: HouseholdRole): boolean =>
  isAdmin(role)

export const canDeleteHousehold = (role: HouseholdRole): boolean =>
  isAdmin(role)

export const canManageMembers = (role: HouseholdRole): boolean => isAdmin(role)

export const canInviteMembers = (role: HouseholdRole): boolean => isAdmin(role)

export const canManageGroups = (role: HouseholdRole): boolean => isAdmin(role)

export const canCreateExpense = (role: HouseholdRole): boolean =>
  isAdmin(role) || role === 'member'

export const canEditOwnExpense = (role: HouseholdRole): boolean =>
  isAdmin(role) || role === 'member'

export const canEditAnyExpense = (role: HouseholdRole): boolean => isAdmin(role)

export const canViewAuditLogs = (role: HouseholdRole): boolean => isAdmin(role)

export const hasHouseholdPermission = (
  role: HouseholdRole,
  permission: HouseholdPermission,
): boolean => {
  switch (permission) {
    case 'manageHouseholdSettings':
      return canManageHouseholdSettings(role)
    case 'deleteHousehold':
      return canDeleteHousehold(role)
    case 'manageMembers':
      return canManageMembers(role)
    case 'inviteMembers':
      return canInviteMembers(role)
    case 'manageGroups':
      return canManageGroups(role)
    case 'createExpense':
      return canCreateExpense(role)
    case 'editOwnExpense':
      return canEditOwnExpense(role)
    case 'editAnyExpense':
      return canEditAnyExpense(role)
    case 'viewAuditLogs':
      return canViewAuditLogs(role)
  }
}
