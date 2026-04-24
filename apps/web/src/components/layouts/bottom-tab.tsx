import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom'

import { BOTTOM_TAB_ITEMS } from '@/lib/constants/navigation'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n'

export function BottomTab() {
  return createPortal(
    <nav
      aria-label={t('shell.protected.nav.ariaLabel')}
      className='fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border/70 bg-background/85 pb-safe backdrop-blur'>
      {BOTTOM_TAB_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          className={({ isActive }) =>
            [
              'flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')
          }
          end={item.to === PATHS.APP_ROOT}
          to={item.to}>
          <item.icon className='h-5 w-5' />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>,
    document.body,
  )
}
