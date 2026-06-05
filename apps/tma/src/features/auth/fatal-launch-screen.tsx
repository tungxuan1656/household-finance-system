import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
import { Button, CardDescription, CardTitle } from '@/components/ui'
import { closeMiniApp } from '@/lib/telegram/back-button'
import {
  getContentSafeAreaInsets,
  getSafeAreaInsets,
  mergeSafeAreaInsets,
} from '@/lib/telegram/safe-area'

import type { AuthError } from './store'

export interface FatalLaunchScreenProps {
  error?: AuthError | null
}

export const FatalLaunchScreen = ({ error }: FatalLaunchScreenProps) => {
  const { t } = useTranslation()
  const safeArea = getSafeAreaInsets()
  const contentSafeArea = getContentSafeAreaInsets()
  const insets = mergeSafeAreaInsets(safeArea, contentSafeArea)

  const titleKey =
    error?.code === 'sessionExpired'
      ? 'tma.auth.sessionExpired'
      : 'tma.auth.launchInvalid'

  const bodyKey =
    error?.code === 'networkError'
      ? 'tma.auth.networkError'
      : 'tma.auth.reopenGuidance'

  return (
    <AppShell>
      <main
        className='grid min-h-0 flex-1 place-items-center p-6 text-center'
        style={{
          paddingInlineStart: `${insets.left}px`,
          paddingInlineEnd: `${insets.right}px`,
          paddingTop: `${insets.top}px`,
          paddingBottom: `${insets.bottom}px`,
        }}>
        <div className='grid max-w-sm gap-3'>
          <CardTitle>{t(titleKey)}</CardTitle>
          <CardDescription>{t(bodyKey)}</CardDescription>
          <Button className='justify-self-center' onClick={closeMiniApp}>
            {t('fatal.close')}
          </Button>
        </div>
      </main>
    </AppShell>
  )
}
