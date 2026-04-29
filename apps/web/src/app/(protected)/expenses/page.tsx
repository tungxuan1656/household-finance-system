'use client'

import { t } from '@/lib/i18n'
import { PlaceholderPage } from '@/views/app/placeholder-page'

export default function ExpensesRoutePage() {
  return (
    <PlaceholderPage
      description={t('app.placeholder.expenses.description')}
      title={t('app.placeholder.expenses.title')}
    />
  )
}
