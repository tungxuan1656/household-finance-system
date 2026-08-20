import { miniApp } from '@tma.js/sdk'
import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { closeMiniApp } from '@/lib/telegram/back-button'

export const FatalLaunchPage = () => {
  const { t } = useTranslation()
  const isCloseAvailable = miniApp.close.isAvailable()

  return (
    <AppShell>
      <main className='grid min-h-0 flex-1 place-items-center p-6'>
        <Card className='w-full max-w-sm'>
          <CardHeader className='text-center'>
            <CardTitle>{t('fatal.title')}</CardTitle>
            <CardDescription>{t('fatal.body')}</CardDescription>
          </CardHeader>
          <CardFooter className='justify-center gap-3'>
            {isCloseAvailable && (
              <TmaHapticButton onClick={closeMiniApp}>
                {t('fatal.close')}
              </TmaHapticButton>
            )}
            <TmaHapticButton
              variant={isCloseAvailable ? 'outline' : 'default'}
              onClick={() => window.location.reload()}>
              {t('dataState.retry')}
            </TmaHapticButton>
          </CardFooter>
        </Card>
      </main>
    </AppShell>
  )
}
