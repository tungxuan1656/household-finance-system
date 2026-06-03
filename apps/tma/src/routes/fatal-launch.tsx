import { miniApp } from '@tma.js/sdk'
import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'

const closeMiniApp = () => {
  miniApp.close.ifAvailable()
}

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
