import { miniApp } from '@tma.js/sdk'
import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
import { Button, CardDescription, CardTitle } from '@/components/ui'
import { closeMiniApp } from '@/lib/telegram/back-button'

export const FatalLaunchPage = () => {
  const { t } = useTranslation()
  const isCloseAvailable = miniApp.close.isAvailable()

  return (
    <AppShell>
      <main className='grid min-h-0 flex-1 place-items-center p-6 text-center'>
        <div className='grid max-w-sm gap-3'>
          <CardTitle>{t('fatal.title')}</CardTitle>
          <CardDescription>{t('fatal.body')}</CardDescription>
          <div className='flex justify-center gap-3'>
            {isCloseAvailable && (
              <Button className='justify-self-center' onClick={closeMiniApp}>
                {t('fatal.close')}
              </Button>
            )}
            <Button
              className='justify-self-center'
              variant={isCloseAvailable ? 'outline' : 'primary'}
              onClick={() => window.location.reload()}>
              {t('dataState.retry')}
            </Button>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
