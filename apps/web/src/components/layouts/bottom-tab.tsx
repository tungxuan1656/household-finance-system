'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'

import {
  BOTTOM_TAB_ITEMS,
  isProtectedNavItemActive,
} from '@/lib/constants/navigation'
import { t } from '@/lib/i18n/t'

export function BottomTab() {
  const pathname = usePathname()

  return createPortal(
    <div className='fixed inset-x-0 bottom-0 z-50 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden'>
      <nav
        aria-label={t('shell.protected.nav.ariaLabel')}
        className='mx-auto flex max-w-md items-center gap-1 rounded-[1.75rem] border border-border/70 bg-card/95 p-2 shadow-xl backdrop-blur-xl'>
        {BOTTOM_TAB_ITEMS.map((item) => {
          const isActive = isProtectedNavItemActive(pathname, item.to)

          return (
            <Link
              key={item.to}
              className={[
                'flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-3xl px-2 py-1 text-[10px] font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              href={item.to}>
              <item.icon className='h-5 w-5' />
              <span className='truncate'>{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </nav>
    </div>,
    document.body,
  )
}
