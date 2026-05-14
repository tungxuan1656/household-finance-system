import { t } from '@/lib/i18n/t'

export const statusLabel = (status: string): string => {
  if (status === 'active') {
    return t('groups.card.statusActive')
  }

  if (status === 'archived') {
    return t('groups.card.statusArchived')
  }

  return status
}
