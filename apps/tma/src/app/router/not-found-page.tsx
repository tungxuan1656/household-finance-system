import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
import { AppVersionLabel } from '@/components/shared/app-version-label'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <AppShell>
      <main className='flex min-h-0 flex-1 flex-col items-center justify-center p-6'>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('notFound.title')}</EmptyTitle>
            <EmptyDescription>{t('notFound.body')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <div className='mt-8'>
          <AppVersionLabel />
        </div>
      </main>
    </AppShell>
  )
}
