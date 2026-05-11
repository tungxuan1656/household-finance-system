'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'

import { BOTTOM_TAB_ITEMS } from '@/lib/constants/navigation'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

export function BottomTab() {
  const pathname = usePathname()

  return createPortal(
    <nav
      aria-label={t('shell.protected.nav.ariaLabel')}
      className='fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border/70 bg-background/80 pb-safe shadow-sm backdrop-blur-xl'>
      {BOTTOM_TAB_ITEMS.map((item) => {
        const isActive =
          item.to === PATHS.APP_ROOT
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`)

        return (
          <Link
            key={item.to}
            className={[
              'flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-1 text-xs transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
            href={item.to}>
            <item.icon className='h-5 w-5' />
            <span>{t(item.labelKey)}</span>
          </Link>
        )
      })}
    </nav>,
    document.body,
  )
}
