'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'

import {
  BOTTOM_TAB_ITEMS,
  isProtectedNavItemActive,
} from '@/lib/constants/navigation'
import { t } from '@/lib/i18n/t'
import { cn } from '@/utils/cn'

export function BottomTab() {
  const pathname = usePathname()

  const isTabRoute = BOTTOM_TAB_ITEMS.some((item) =>
    isProtectedNavItemActive(pathname, item.to),
  )

  if (!isTabRoute) {
    return null
  }

  return createPortal(
    <div className='fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-card/95 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden'>
      <nav
        aria-label={t('shell.protected.nav.ariaLabel')}
        className='mx-auto flex h-14 max-w-md items-stretch gap-1 px-2 pt-1.5'>
        {BOTTOM_TAB_ITEMS.map((item) => {
          const isActive = isProtectedNavItemActive(pathname, item.to)

          return (
            <Link
              key={item.to}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              href={item.to}>
              <item.icon className={cn('size-5', isActive && 'stroke-[2.5]')} />
              <span className='max-w-full truncate'>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </nav>
    </div>,
    document.body,
  )
}
