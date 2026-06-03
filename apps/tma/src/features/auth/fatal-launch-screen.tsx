import { miniApp } from '@tma.js/sdk'
import { useTranslation } from 'react-i18next'

import { AppShell } from '@/components/shared/app-shell'
import {
  getContentSafeAreaInsets,
  getSafeAreaInsets,
} from '@/lib/telegram/safe-area'

import type { AuthError } from './store'

export interface FatalLaunchScreenProps {
  error?: AuthError | null
}

const closeMiniApp = () => {
  miniApp.close.ifAvailable()
}

export const FatalLaunchScreen = ({ error }: FatalLaunchScreenProps) => {
  const { t } = useTranslation()
  const safeArea = getSafeAreaInsets()
  const contentSafeArea = getContentSafeAreaInsets()
  const top = Math.max(safeArea.top, contentSafeArea.top)
  const bottom = Math.max(safeArea.bottom, contentSafeArea.bottom)
  const left = Math.max(safeArea.left, contentSafeArea.left)
  const right = Math.max(safeArea.right, contentSafeArea.right)

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
          paddingInlineStart: `${left}px`,
          paddingInlineEnd: `${right}px`,
          paddingTop: `${top}px`,
          paddingBottom: `${bottom}px`,
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
