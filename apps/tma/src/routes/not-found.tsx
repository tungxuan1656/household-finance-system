import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
import { CardDescription, CardTitle } from '@/components/ui'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <AppShell>
      <main className='grid min-h-0 flex-1 place-items-center p-6 text-center'>
        <div className='grid max-w-sm gap-3'>
          <CardTitle>{t('notFound.title')}</CardTitle>
          <CardDescription>{t('notFound.body')}</CardDescription>
        </div>
      </main>
    </AppShell>
  )
}
