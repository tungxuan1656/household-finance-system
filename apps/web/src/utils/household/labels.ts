import type { TranslationKey } from '@/lib/i18n/i18n-init'
import { t } from '@/lib/i18n/t'
import type { DefaultVisibility, HouseholdRoleDTO } from '@/types/household'

const ROLE_LABEL_KEYS: Record<HouseholdRoleDTO, TranslationKey> = {
  admin: 'app.householdDetail.members.invite.fields.role.options.admin',
  member: 'app.householdDetail.members.invite.fields.role.options.member',
}

const VISIBILITY_LABEL_KEYS: Record<DefaultVisibility, TranslationKey> = {
  private: 'app.householdDetail.fields.defaultVisibility.options.private',
  household: 'app.householdDetail.fields.defaultVisibility.options.household',
}

export const getHouseholdRoleLabel = (role: HouseholdRoleDTO): string =>
  t(ROLE_LABEL_KEYS[role])

export const getHouseholdVisibilityLabel = (
  visibility: DefaultVisibility,
): string => t(VISIBILITY_LABEL_KEYS[visibility])
