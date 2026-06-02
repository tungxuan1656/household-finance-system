import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'

export const HomePage = () => {
  const { t } = useTranslation()

  return (
    <AppShell>
      <main className='tma-home'>
        <h1>{t('home.greeting')}</h1>
        <p>{t('home.subtitle')}</p>
      </main>
    </AppShell>
  )
}
