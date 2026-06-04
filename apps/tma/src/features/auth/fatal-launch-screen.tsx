import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
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
        className='tma-fatal'
        style={{
          paddingInlineStart: `${insets.left}px`,
          paddingInlineEnd: `${insets.right}px`,
          paddingTop: `${insets.top}px`,
          paddingBottom: `${insets.bottom}px`,
        }}>
        <h1>{t(titleKey)}</h1>
        <p>{t(bodyKey)}</p>
        <button type='button' onClick={closeMiniApp}>
          {t('fatal.close')}
        </button>
      </main>
    </AppShell>
  )
}
