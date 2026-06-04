import { resolveInitials } from '@/features/home/presentation'

import type { HouseholdRoleDTO } from './types'

export const MAX_AVATAR_SIZE_BYTES = 8 * 1024 * 1024

export const getHouseholdAvatarFallback = (name: string): string => {
  const initials = resolveInitials(name)

  return initials.length > 0 ? initials : 'GD'
}

export const getHouseholdRoleLabel = (role: HouseholdRoleDTO): string =>
  role === 'admin' ? 'Quản trị' : 'Thành viên'

export const formatMemberCountLabel = (memberCount: number): string =>
  memberCount === 1 ? '1 thành viên' : `${memberCount} thành viên`
