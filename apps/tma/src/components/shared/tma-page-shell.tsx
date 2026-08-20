import type { ReactNode } from 'react'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { useContainerScrollRestoration } from '@/app/router/use-container-scroll-restoration'
import { AppShell } from '@/components/shared/app-shell'
import PullToRefresh from '@/components/shared/pull-to-refresh'
import { TMA_PATHS } from '@/lib/constants/routes'
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

export interface TmaPageFooterProps {
  children: ReactNode
  className?: string
}

/**
 * Inner layout helper for `TmaPageShell` footers.
 *
 * Provides a centered, max-width flex row with consistent gap.
 * Works for both single CTA and dual-button layouts:
 * - Single:  <TmaPageFooter><Button className="flex-1">Save</Button></TmaPageFooter>
 * - Dual:    <TmaPageFooter><Button variant="secondary">Cancel</Button><Button>Confirm</Button></TmaPageFooter>
 *
 * Each direct child is made `flex-1` so buttons share width equally.
 * Consumers may override with explicit `className` on children if needed.
 */
export const TmaPageFooter = ({ children, className }: TmaPageFooterProps) => (
  <div
    className={cn(
      'mx-auto flex w-full max-w-160 items-center gap-3 *:min-w-0 *:flex-1',
      className,
    )}>
    {children}
  </div>
)

export interface TmaPageShellProps {
  children: ReactNode
  title: string
  bubbleHref?: string
  contentClassName?: string
  onRefresh?: () => Promise<void>
  /** Fixed bottom bar content — rendered as a blurred footer above the safe area. */
  footer?: ReactNode
  /** Optional extra class for the fixed footer outer shell (background/border overrides). */
  footerClassName?: string
  /** Alias for `footer` — kept for ergonomic `TmaPageFooter` prop naming; prefer `footer`. */
  TmaPageFooter?: ReactNode
}

export const TmaPageShell = ({
  bubbleHref,
  children,
  contentClassName,
  footer: footerProp,
  footerClassName,
  onRefresh,
  title,
  TmaPageFooter: footerAlias,
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

  // Prefer `footer` prop; `TmaPageFooter` is a legacy alias for the same slot.
  const footer = footerProp ?? footerAlias
  const hasFooter = footer !== undefined && footer !== null && footer !== false

  /**
   * Padding strategy (avoids content hidden behind fixed chrome):
   * - no tabs, no footer:  48px + safe (base breathing)
   * - tabs, no footer:      96px + safe (pill ~60px + 14 offset + breathing)
   * - no tabs, footer:      96px + safe (footer ~64px + breathing) — footer at bottom-0
   * - tabs + footer:       168px + safe (footer 64 + gap 12 + pill 60 + 14 offset + breathing)
   *
   * Footer is always `fixed bottom-0 z-20` with inner `pb-[calc(12px+safe)]`.
   * When both chrome are present, tabs are lifted above the footer
   * (`bottom-[calc(80px+safe)]`) so the CTA stays at the thumb edge (z-20) and
   * the pill floats above it (z-30). See render below.
   */
  const content = (
    <main
      ref={contentRef}
      className={cn(
        'relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 [-webkit-overflow-scrolling:touch] md:px-6',
        !hasFooter &&
          !isShowBottomTabs &&
          'pb-[calc(48px+var(--tma-content-safe-bottom))]',
        !hasFooter &&
          isShowBottomTabs &&
          'pb-[calc(96px+var(--tma-content-safe-bottom))]',
        hasFooter &&
          !isShowBottomTabs &&
          'pb-[calc(96px+var(--tma-content-safe-bottom))]',
        hasFooter &&
          isShowBottomTabs &&
          'pb-[calc(168px+var(--tma-content-safe-bottom))]',
      )}
      data-testid='tma-page-scroll'>
      {/* Content wrapper owns vertical rhythm — pages no longer need manual gap-6 */}
      <div className={cn('flex flex-col gap-6', contentClassName)}>
        {children}
      </div>
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

        {hasFooter ? (
          <div
            className={cn(
              // Fixed footer shell — blurred, bordered, respects Telegram safe area via inner padding
              'fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200/60 bg-white/85 shadow-[0_-8px_32px_rgba(17,24,39,0.08)] backdrop-blur-xl supports-backdrop-filter:bg-white/75 dark:border-zinc-800 dark:bg-zinc-900/85 dark:supports-backdrop-filter:bg-zinc-900/75',
              footerClassName,
            )}>
            <div className='px-4 pt-3 pb-[calc(12px+var(--tma-content-safe-bottom))] md:px-6'>
              {footer}
            </div>
          </div>
        ) : null}

        {isShowBottomTabs ? (
          <TmaBottomTabs
            bubbleHref={bubbleHref}
            className={
              hasFooter
                ? // Lift pill above the footer so both are visible; footer stays at bottom-0 (thumb zone)
                  'bottom-[calc(80px+var(--tma-content-safe-bottom))]'
                : undefined
            }
          />
        ) : null}
      </div>
    </AppShell>
  )
}

// Barrel re-exports — preserves all original consumer import paths
export { TmaBottomTabs } from './tma-bottom-tabs'
export { TmaCategoryIconBadge } from './tma-category-icon-badge'
export { TmaInlineAction } from './tma-inline-action'
export { TmaPageHeader, TmaPageTitleBar } from './tma-page-header'
