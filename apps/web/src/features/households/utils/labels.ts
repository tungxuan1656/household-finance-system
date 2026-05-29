import type { HouseholdRoleDTO } from '@/features/households/types/household'
import type { TranslationKey } from '@/lib/i18n/i18n-init'
import { t } from '@/lib/i18n/t'

const ROLE_LABEL_KEYS: Record<HouseholdRoleDTO, TranslationKey> = {
  admin: 'app.householdDetail.members.invite.fields.role.options.admin',
  member: 'app.householdDetail.members.invite.fields.role.options.member',
}

export const getHouseholdRoleLabel = (role: HouseholdRoleDTO): string =>
  t(ROLE_LABEL_KEYS[role])
