'use client'

import { t } from '@/lib/i18n/t'
import { PlaceholderPage } from '@/views/app/placeholder-page'

export default function InsightsRoutePage() {
  return (
    <PlaceholderPage
      description={t('app.placeholder.insights.description')}
      title={t('app.placeholder.insights.title')}
    />
  )
}
