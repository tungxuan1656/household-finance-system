import type { ReactNode } from 'react'
import { useEffect, useEffectEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AppShell } from '@/components/shared/app-shell'
import {
  ChevronRightIcon,
  CloseIcon,
  HomeIcon,
  PlusIcon,
  StatisticsIcon,
} from '@/components/shared/tma-icons'
import {
  closeMiniApp,
  hideBackButton,
  showBackButton as bindBackButton,
} from '@/lib/telegram/back-button'
import { hideBottomButton } from '@/lib/telegram/bottom-button'
import { impact, selection } from '@/lib/telegram/haptics'

const joinClassNames = (
  ...values: Array<string | false | null | undefined>
): string => values.filter(Boolean).join(' ')

const tabItems = [
  {
    href: '/',
    label: 'Trang chủ',
    icon: HomeIcon,
    match: (path: string) => path === '/' || path === '/home',
  },
  {
    href: '/statistics',
    label: 'Thống kê',
    icon: StatisticsIcon,
    match: (path: string) => path.startsWith('/statistics'),
  },
] as const

const TmaBottomTabs = ({
  bubbleHref = '/expenses/new/category',
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
  subtitle?: string
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
  <header className='tma-page-header'>
    <div className='tma-page-header__lead'>
      {leading ? (
        <div className='tma-page-header__avatar'>{leading}</div>
      ) : null}
      <div>
        {eyebrow ? <p className='tma-page-header__eyebrow'>{eyebrow}</p> : null}
        <h1 className='tma-page-header__title'>{title}</h1>
        {subtitle ? (
          <p className='tma-page-header__subtitle'>{subtitle}</p>
        ) : null}
      </div>
    </div>

    {trailing ? (
      <div className='tma-page-header__actions'>{trailing}</div>
    ) : null}
  </header>
)

export interface TmaTopBarProps {
  /** Show a Close pill on the left that calls miniApp.close(). */
  closeAction?: boolean
  /** Right-side trailing element (e.g. month chip on home). */
  trailing?: ReactNode
}

/**
 * In-page top bar that mimics Telegram's native header buttons.
 * Used so we can show a labelled "Close" on root screens and a "Back"
 * pill on detail screens without depending on Telegram's fixed BackButton.
 */
export const TmaTopBar = ({
  closeAction = false,
  trailing,
}: TmaTopBarProps) => {
  if (!closeAction && !trailing) {
    return null
  }

  return (
    <div className='tma-topbar'>
      {closeAction ? (
        <button
          aria-label='Đóng ứng dụng'
          className='tma-nav-pill'
          type='button'
          onClick={() => {
            impact('light')
            closeMiniApp()
          }}>
          <span className='tma-nav-pill__icon'>
            <CloseIcon />
          </span>
          <span>Đóng</span>
        </button>
      ) : (
        <span />
      )}

      {trailing ? (
        <div className='tma-page-header__actions'>{trailing}</div>
      ) : null}
    </div>
  )
}

export interface TmaPageShellProps {
  children: ReactNode
  header: ReactNode
  showBottomTabs?: boolean
  showBackButton?: boolean
  /**
   * Show a "Close" pill in the top bar. Use on root screens where the
   * back button would have nothing to go back to. Implies hiding the
   * Telegram native BackButton.
   */
  closeAction?: boolean
  backTo?: string
  reserveBottomButton?: boolean
  bubbleHref?: string
  contentClassName?: string
}

export const TmaPageShell = ({
  children,
  header,
  showBottomTabs = true,
  showBackButton = false,
  closeAction = false,
  backTo,
  reserveBottomButton = false,
  bubbleHref,
  contentClassName,
}: TmaPageShellProps) => {
  const navigate = useNavigate()

  const handleBack = useEffectEvent(() => {
    if (backTo) {
      navigate(backTo)

      return
    }

    if (window.history.length > 1) {
      navigate(-1)

      return
    }

    navigate('/')
  })

  useEffect(() => {
    hideBottomButton()

    if (closeAction) {
      // Root screen: hide Telegram native BackButton, render our Close pill.
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
          {closeAction ? <TmaTopBar closeAction /> : null}
          {header}

          <main
            className={joinClassNames(
              'tma-page-shell__content',
              contentClassName,
            )}>
            {children}
          </main>
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
