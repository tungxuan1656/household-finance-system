import { type ReactNode, useEffect, useEffectEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AppShell } from '@/components/shared/app-shell'
import {
  ChevronRightIcon,
  HomeIcon,
  PlusIcon,
  SettingsIcon,
  StatisticsIcon,
} from '@/components/shared/tma-icons'
import {
  hideBackButton,
  showBackButton as bindBackButton,
} from '@/lib/telegram/back-button'
import { hideBottomButton } from '@/lib/telegram/bottom-button'
import { selection } from '@/lib/telegram/haptics'

const tabItems = [
  { href: '/', label: 'Trang chủ', icon: HomeIcon },
  { href: '/statistics', label: 'Thống kê', icon: StatisticsIcon },
  { href: '/settings', label: 'Cài đặt', icon: SettingsIcon },
] as const

const joinClassNames = (
  ...values: Array<string | false | null | undefined>
): string => values.filter(Boolean).join(' ')

interface TmaBottomTabsProps {
  bubbleHref?: string
}

const TmaBottomTabs = ({
  bubbleHref = '/expenses/new/category',
}: TmaBottomTabsProps) => {
  const location = useLocation()

  return (
    <div aria-label='Điều hướng chính' className='tma-bottom-tabs'>
      <nav className='tma-bottom-tabs__rail'>
        {tabItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/'
              ? location.pathname === '/' || location.pathname === '/home'
              : location.pathname === href

          return (
            <Link
              key={href}
              className={joinClassNames(
                'tma-bottom-tabs__item',
                isActive && 'is-active',
              )}
              to={href}
              onClick={() => {
                selection()
              }}>
              <Icon className='tma-bottom-tabs__icon' height='20' width='20' />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <Link
        aria-label='Thêm chi tiêu'
        className='tma-bottom-tabs__bubble'
        to={bubbleHref}
        onClick={() => {
          selection()
        }}>
        <PlusIcon height='22' width='22' />
      </Link>
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

export interface TmaPageShellProps {
  children: ReactNode
  header: ReactNode
  showBottomTabs?: boolean
  showBackButton?: boolean
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

    if (!showBackButton) {
      hideBackButton()

      return
    }

    const cleanup = bindBackButton(() => {
      handleBack()
    })

    return () => {
      cleanup()
      hideBackButton()
    }
  }, [handleBack, showBackButton])

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
    <ChevronRightIcon height='16' width='16' />
  </Link>
)
