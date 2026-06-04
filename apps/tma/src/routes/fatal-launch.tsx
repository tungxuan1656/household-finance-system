import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
import { closeMiniApp } from '@/lib/telegram/back-button'

export const FatalLaunchPage = () => {
  const { t } = useTranslation()

  return (
    <AppShell>
      <main className='tma-fatal'>
        <h1>{t('fatal.title')}</h1>
        <p>{t('fatal.body')}</p>
        <button type='button' onClick={closeMiniApp}>
          {t('fatal.close')}
        </button>
      </main>
    </AppShell>
  )
}
