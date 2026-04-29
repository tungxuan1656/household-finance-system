'use client'

import { t } from '@/lib/i18n/t'
import { PlaceholderPage } from '@/views/app/placeholder-page'

export default function BudgetsRoutePage() {
  return (
    <PlaceholderPage
      description={t('app.placeholder.budgets.description')}
      title={t('app.placeholder.budgets.title')}
    />
  )
}
