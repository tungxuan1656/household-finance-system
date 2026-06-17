import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
import { AppVersionLabel } from '@/components/shared/app-version-label'
import { CardDescription, CardTitle } from '@/components/ui'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <AppShell>
      <main className='flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center'>
        <div className='grid max-w-sm gap-3'>
          <CardTitle>{t('notFound.title')}</CardTitle>
          <CardDescription>{t('notFound.body')}</CardDescription>
        </div>
        <div className='mt-8'>
          <AppVersionLabel />
        </div>
      </main>
    </AppShell>
  )
}
