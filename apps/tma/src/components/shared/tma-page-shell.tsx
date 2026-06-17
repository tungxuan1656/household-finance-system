import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { useContainerScrollRestoration } from '@/app/router/use-container-scroll-restoration'
import { AppShell } from '@/components/shared/app-shell'
import PullToRefresh from '@/components/shared/pull-to-refresh'
import { TMA_PATHS } from '@/lib/constants/routes'
import { hideBottomButton } from '@/lib/telegram/bottom-button'
import { cn } from '@/lib/utils'

import { PullToRefreshSpinner, TmaBottomTabs } from './tma-bottom-tabs'
import { TmaPageTitleBar } from './tma-page-header'

export interface TmaPageHeaderProps {
  title: string
  eyebrow?: string
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
}

export interface TmaCategoryIconBadgeProps {
  accent: { background: string; foreground: string }
  iconUrl?: string | null
  symbol: string
  size?: 'sm' | 'md'
}

export interface TmaPageShellProps {
  children: ReactNode
  title: string
  reserveBottomButton?: boolean
  bubbleHref?: string
  contentClassName?: string
  onRefresh?: () => Promise<void>
}

export const TmaPageShell = ({
  bubbleHref,
  children,
  contentClassName,
  onRefresh,
  reserveBottomButton = false,
  title,
}: TmaPageShellProps) => {
  const { t } = useTranslation()
  const contentRef = useRef<HTMLElement | null>(null)

  useContainerScrollRestoration(contentRef)

  const location = useLocation()
  const isShowBottomTabs = useMemo(
    () =>
      location.pathname === TMA_PATHS.root ||
      location.pathname === TMA_PATHS.statistics,
    [location.pathname],
  )

  useEffect(() => {
    hideBottomButton()
  }, [])

  const content = (
    <main
      ref={contentRef}
      className={cn(
        'relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-[calc(96px+var(--tma-content-safe-bottom))] [-webkit-overflow-scrolling:touch] md:px-6',
        !isShowBottomTabs && 'pb-[calc(48px+var(--tma-content-safe-bottom))]',
        reserveBottomButton &&
          'pb-[calc(100px+var(--tma-content-safe-bottom))]',
        contentClassName,
      )}
      data-testid='tma-page-scroll'>
      {children}
    </main>
  )

  return (
    <AppShell>
      <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
        <div className='relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden'>
          <TmaPageTitleBar title={title} />

          {onRefresh ? (
            <PullToRefresh
              pullDownThreshold={80}
              pullingContent={<PullToRefreshSpinner />}
              refreshingContent={
                <PullToRefreshSpinner label={t('shell.refreshing')} />
              }
              resistance={2.5}
              onRefresh={onRefresh}>
              {content}
            </PullToRefresh>
          ) : (
            content
          )}
        </div>

        {isShowBottomTabs ? <TmaBottomTabs bubbleHref={bubbleHref} /> : null}
      </div>
    </AppShell>
  )
}

// Barrel re-exports — preserves all original consumer import paths
export { TmaBottomTabs } from './tma-bottom-tabs'
export { TmaCategoryIconBadge } from './tma-category-icon-badge'
export { TmaInlineAction } from './tma-inline-action'
export { TmaPageHeader, TmaPageTitleBar } from './tma-page-header'
