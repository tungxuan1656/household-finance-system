import type { ReactNode } from 'react'
import { useEffect, useEffectEvent, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

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
import {
  hideBackButton,
  showBackButton as bindBackButton,
} from '@/lib/telegram/back-button'
import { hideBottomButton } from '@/lib/telegram/bottom-button'
import { impact, selection } from '@/lib/telegram/haptics'

const joinClassNames = (
  ...values: Array<string | false | null | undefined>
): string => values.filter(Boolean).join(' ')

const PullToRefreshSpinner = ({ label }: { label?: string }) => (
  <div className='tma-ptr-spinner-wrap'>
    <span className='tma-ptr-spinner-icon' />
    {label && <span className='tma-ptr-spinner-label'>{label}</span>}
  </div>
)

const HOME_FALLBACK_ROUTE = TMA_PATHS.root

export const canUseRouterBack = (historyState: unknown): boolean =>
  Boolean(
    historyState &&
    typeof historyState === 'object' &&
    'idx' in historyState &&
    typeof historyState.idx === 'number' &&
    historyState.idx > 0,
  )

const tabItems = [
  {
    href: HOME_FALLBACK_ROUTE,
    label: 'Trang chủ',
    icon: HomeIcon,
    match: (path: string) => path === TMA_PATHS.root || path === TMA_PATHS.home,
  },
  {
    href: TMA_PATHS.statistics,
    label: 'Thống kê',
    icon: StatisticsIcon,
    match: (path: string) => path.startsWith(TMA_PATHS.statistics),
  },
] as const

const TmaBottomTabs = ({
  bubbleHref = TMA_PATHS.expensesNewCategory,
}: {
  bubbleHref?: string
}) => {
  const location = useLocation()

  return (
    <div aria-label='Điều hướng chính' className='tma-bottom-tabs'>
      <nav className='tma-bottom-tabs__rail'>
        <div className='tma-bottom-tabs__slot tma-bottom-tabs__slot--start'>
          {tabItems.slice(0, 1).map(({ href, label, icon: Icon, match }) => {
            const isActive = match(location.pathname)

            return (
              <Link
                key={href}
                aria-current={isActive ? 'page' : undefined}
                className={joinClassNames(
                  'tma-bottom-tabs__item',
                  isActive && 'is-active',
                )}
                to={href}
                onClick={() => {
                  selection()
                }}>
                <Icon
                  className='tma-bottom-tabs__icon'
                  height='19'
                  width='19'
                />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        <Link
          aria-label='Tạo chi tiêu mới'
          className='tma-bottom-tabs__action'
          to={bubbleHref}
          onClick={() => {
            impact('medium')
          }}>
          <PlusIcon
            className='tma-bottom-tabs__action-icon'
            height='24'
            width='24'
          />
        </Link>

        <div className='tma-bottom-tabs__slot tma-bottom-tabs__slot--end'>
          {tabItems.slice(1).map(({ href, label, icon: Icon, match }) => {
            const isActive = match(location.pathname)

            return (
              <Link
                key={href}
                aria-current={isActive ? 'page' : undefined}
                className={joinClassNames(
                  'tma-bottom-tabs__item',
                  isActive && 'is-active',
                )}
                to={href}
                onClick={() => {
                  selection()
                }}>
                <Icon
                  className='tma-bottom-tabs__icon'
                  height='19'
                  width='19'
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
  <section className='tma-page-header'>
    <div className='tma-page-header__lead'>
      {leading ? (
        <div className='tma-page-header__avatar'>{leading}</div>
      ) : null}
      <div>
        {eyebrow ? <p className='tma-page-header__eyebrow'>{eyebrow}</p> : null}
        <h2 className='tma-page-header__title'>{title}</h2>
        {subtitle ? (
          <p className='tma-page-header__subtitle'>{subtitle}</p>
        ) : null}
      </div>
    </div>

    {trailing ? (
      <div className='tma-page-header__actions'>{trailing}</div>
    ) : null}
  </section>
)

export const TmaPageTitleBar = ({ title }: { title: string }) => (
  <header className='tma-page-titlebar'>
    <h1 className='tma-page-titlebar__title'>{title}</h1>
  </header>
)

export interface TmaPageShellProps {
  children: ReactNode
  title: string
  showBottomTabs?: boolean
  showBackButton?: boolean
  /**
   * Root screen semantics. When true, the shell hides Telegram BackButton so
   * fullscreen/native chrome can own the close affordance instead.
   */
  closeAction?: boolean
  backTo?: string
  reserveBottomButton?: boolean
  bubbleHref?: string
  contentClassName?: string
  /**
   * Enable pull-to-refresh via react-simple-pull-to-refresh.
   * When provided, wrapping onRefresh callback will trigger pull-to-refresh.
   */
  onRefresh?: () => Promise<void>
}

export const TmaPageShell = ({
  children,
  title,
  showBottomTabs = true,
  showBackButton = false,
  closeAction = false,
  backTo,
  reserveBottomButton = false,
  bubbleHref,
  contentClassName,
  onRefresh,
}: TmaPageShellProps) => {
  const navigate = useNavigate()
  const contentRef = useRef<HTMLElement | null>(null)

  useContainerScrollRestoration(contentRef)

  const handleBack = useEffectEvent(() => {
    if (canUseRouterBack(window.history.state)) {
      navigate(-1)

      return
    }

    navigate(backTo ?? HOME_FALLBACK_ROUTE, { replace: true })
  })

  useEffect(() => {
    hideBottomButton()

    if (closeAction) {
      hideBackButton()

      return
    }

    if (!showBackButton) {
      hideBackButton()

      return
    }

    const cleanup = bindBackButton(() => {
      impact('light')
      handleBack()
    })

    return () => {
      cleanup()
      hideBackButton()
    }
  }, [handleBack, showBackButton, closeAction])

  return (
    <AppShell>
      <div
        className={joinClassNames(
          'tma-page-shell',
          !showBottomTabs && 'tma-page-shell--focus',
          reserveBottomButton && 'tma-page-shell--native-bottom',
        )}>
        <div className='tma-page-shell__glow tma-page-shell__glow--primary' />
        <div className='tma-page-shell__glow tma-page-shell__glow--accent' />

        <div className='tma-page-shell__viewport'>
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
              <main
                ref={contentRef}
                className={joinClassNames(
                  'tma-page-shell__content',
                  contentClassName,
                )}>
                {children}
              </main>
            </PullToRefresh>
          ) : (
            <main
              ref={contentRef}
              className={joinClassNames(
                'tma-page-shell__content',
                contentClassName,
              )}>
              {children}
            </main>
          )}
        </div>

        {showBottomTabs ? <TmaBottomTabs bubbleHref={bubbleHref} /> : null}
      </div>
    </AppShell>
  )
}

export interface TmaBadgeProps {
  accent: { background: string; foreground: string }
  label: string
  size?: 'sm' | 'md'
}

export const TmaMonogramBadge = ({
  accent,
  label,
  size = 'md',
}: TmaBadgeProps) => (
  <span
    className={joinClassNames('tma-monogram', size === 'sm' && 'is-sm')}
    style={{
      backgroundColor: accent.background,
      color: accent.foreground,
    }}>
    {label}
  </span>
)

export const TmaInlineAction = ({
  children,
  href,
}: {
  children: ReactNode
  href: string
}) => (
  <Link className='tma-inline-action' to={href} onClick={() => selection()}>
    <span>{children}</span>
    <ChevronRightIcon height='14' width='14' />
  </Link>
)
