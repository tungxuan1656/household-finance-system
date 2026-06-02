import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <AppShell>
      <main className='tma-fatal'>
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.body')}</p>
      </main>
    </AppShell>
  )
}
