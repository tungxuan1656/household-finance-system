import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useContainerScrollRestoration } from '@/app/router/use-container-scroll-restoration'
import { AppShell } from '@/components/shared/app-shell'
import PullToRefresh from '@/components/shared/pull-to-refresh'
import {
  ChevronRightIcon,
  HomeIcon,
  PlusIcon,
  StatisticsIcon,
} from '@/components/shared/tma-icons'
import { TMA_PATHS } from '@/lib/constants/routes'
import { hideBottomButton } from '@/lib/telegram/bottom-button'
import { impact, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

const PullToRefreshSpinner = ({ label }: { label?: string }) => (
  <div className='grid justify-items-center gap-2 py-2 text-xs font-semibold text-tma-text-muted'>
    <span className='size-5 animate-tma-spin rounded-full border-2 border-current border-t-transparent' />
    {label ? <span>{label}</span> : null}
  </div>
)

const HOME_FALLBACK_ROUTE = TMA_PATHS.root

const tabItems = [
  {
    href: HOME_FALLBACK_ROUTE,
    label: 'Trang chủ',
    icon: HomeIcon,
    match: (path: string) => path === TMA_PATHS.root,
  },
  {
    href: TMA_PATHS.statistics,
    label: 'Thống kê',
    icon: StatisticsIcon,
    match: (path: string) => path === TMA_PATHS.statistics,
  },
] as const

const TmaBottomTabs = ({
  bubbleHref = TMA_PATHS.expensesNewCategory,
}: {
  bubbleHref?: string
}) => {
  const location = useLocation()

  return (
    <div
      aria-label='Điều hướng chính'
      className='pointer-events-none fixed right-0 bottom-[calc(14px+var(--tma-content-safe-bottom))] left-0 z-30 flex justify-center px-4'>
      <nav className='pointer-events-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 rounded-[28px] border border-white/50 bg-white/55 p-1 shadow-[0_6px_20px_rgba(17,24,39,0.05),0_1px_2px_rgba(17,24,39,0.04),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(17,24,39,0.04)] backdrop-blur-md md:min-w-90'>
        <div className='flex justify-start'>
          {tabItems.slice(0, 1).map(({ href, label, icon: Icon, match }) => {
            const isActive = match(location.pathname)

            return (
              <Link
                key={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex h-13 min-w-20 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[10px] font-semibold text-tma-text-muted transition-colors',
                  isActive && 'bg-tma-primary/10 text-tma-primary',
                )}
                to={href}
                onClick={() => {
                  selection()
                }}>
                <Icon
                  className={cn(
                    'size-5 transition-transform',
                    isActive && '-translate-y-px',
                  )}
                  height='20'
                  width='20'
                />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        <Link
          aria-label='Tạo chi tiêu mới'
          className='pointer-events-auto mx-1 -my-4 grid size-13.5 place-items-center rounded-full bg-linear-to-br from-[#2a3a5c] to-tma-text-strong text-white shadow-[0_8px_20px_rgba(17,24,39,0.16),inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_4px_rgba(255,255,255,0.55)] transition active:scale-95'
          to={bubbleHref}
          onClick={() => {
            impact('medium')
          }}>
          <PlusIcon height='24' width='24' />
        </Link>

        <div className='flex justify-end'>
          {tabItems.slice(1).map(({ href, label, icon: Icon, match }) => {
            const isActive = match(location.pathname)

            return (
              <Link
                key={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex h-13 min-w-20 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[10px] font-semibold text-tma-text-muted transition-colors',
                  isActive && 'bg-tma-primary/10 text-tma-primary',
                )}
                to={href}
                onClick={() => {
                  selection()
                }}>
                <Icon
                  className={cn(
                    'size-5 transition-transform',
                    isActive && '-translate-y-px',
                  )}
                  height='20'
                  width='20'
                />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export interface TmaPageHeaderProps {
  title: string
  eyebrow?: string
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
}

export const TmaPageHeader = ({
  title,
  eyebrow,
  subtitle,
  leading,
  trailing,
}: TmaPageHeaderProps) => (
  <section className='flex items-start justify-between gap-3 px-1 py-3 md:px-6'>
    <div className='flex min-w-0 items-center gap-3'>
      {leading ? (
        <div className='grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br from-tma-primary/20 to-tma-positive/30 text-sm font-bold text-tma-text-strong shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]'>
          {leading}
        </div>
      ) : null}
      <div className='min-w-0'>
        {eyebrow ? (
          <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'>
            {eyebrow}
          </p>
        ) : null}
        <h2 className='m-0 mt-1 text-xl leading-tight font-bold text-tma-text-strong'>
          {title}
        </h2>
        {subtitle ? (
          <p className='m-0 mt-1 text-sm leading-normal text-tma-text-muted'>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>

    {trailing ? (
      <div className='flex shrink-0 items-center gap-2'>{trailing}</div>
    ) : null}
  </section>
)

export const TmaPageTitleBar = ({ title }: { title: string }) => (
  <header className='grid min-h-11 place-items-center'>
    <h1 className='m-0 text-base leading-tight font-bold text-tma-text-strong'>
      {title}
    </h1>
  </header>
)

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
                <PullToRefreshSpinner label='Đang làm mới...' />
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

export interface TmaCategoryIconBadgeProps {
  accent: { background: string; foreground: string }
  iconUrl?: string | null
  symbol: string
  size?: 'sm' | 'md'
}

export const TmaCategoryIconBadge = ({
  accent,
  iconUrl,
  symbol,
  size = 'md',
}: TmaCategoryIconBadgeProps) => (
  <span
    aria-hidden='true'
    className={cn(
      'grid shrink-0 place-items-center overflow-hidden font-bold',
      size === 'sm' && 'size-10 rounded-[14px] text-[11px]',
      size === 'md' && 'size-12 rounded-[18px] text-xs',
    )}
    style={{ backgroundColor: accent.background, color: accent.foreground }}>
    {iconUrl ? (
      <img
        alt=''
        className='size-[58%] object-contain'
        loading='lazy'
        src={iconUrl}
      />
    ) : (
      symbol
    )}
  </span>
)

export const TmaInlineAction = ({
  children,
  href,
}: {
  children: ReactNode
  href: string
}) => (
  <Link
    className='inline-flex items-center gap-1 text-xs font-bold text-tma-primary'
    to={href}
    onClick={() => selection()}>
    {children}
    <ChevronRightIcon height='14' width='14' />
  </Link>
)
