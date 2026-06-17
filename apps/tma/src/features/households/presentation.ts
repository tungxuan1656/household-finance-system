import { resolveInitials } from '@/features/home/presentation'
import { capitalize } from '@/lib/period'

import type { HouseholdRoleDTO } from './types'

export const getHouseholdAvatarFallback = (name: string): string => {
  const initials = resolveInitials(name)

  return initials.length > 0 ? initials : 'GD'
}

export const getHouseholdRoleLabel = (
  role: HouseholdRoleDTO,
  t: (key: string, options?: Record<string, unknown>) => string,
): string => t(`households.role${capitalize(role)}`)

export const formatMemberCountLabel = (
  memberCount: number,
  t: (key: string, options?: Record<string, unknown>) => string,
): string =>
  memberCount === 1
    ? t('households.memberCountOne')
    : t('households.memberCountMany', { count: memberCount })
