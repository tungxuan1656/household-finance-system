import { NavLink } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APP_MENU_ITEMS } from '@/lib/constants/navigation'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n'

interface AppSidebarProps {
  onSignOut: () => void
}

export function AppSidebar({ onSignOut }: AppSidebarProps) {
  return (
    <aside className='flex flex-col gap-4 rounded-none border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur'>
      <div className='space-y-2'>
        <Badge className='w-fit' variant='secondary'>
          {t('shell.protected.badge')}
        </Badge>

        <div>
          <h2 className='font-heading text-lg'>{t('shell.protected.title')}</h2>
          <p className='text-xs text-muted-foreground'>
            {t('shell.protected.description')}
          </p>
        </div>
      </div>

      <nav
        aria-label={t('shell.protected.nav.ariaLabel')}
        className='flex flex-col gap-1'>
        {APP_MENU_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-2 rounded-none px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            }
            end={item.to === PATHS.APP_ROOT}
            to={item.to}>
            <item.icon className='h-4 w-4' />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className='mt-auto space-y-3 rounded-none border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground'>
        <p>{t('shell.protected.footer')}</p>
        <Button className='w-full' variant='outline' onClick={onSignOut}>
          {t('common.actions.signOut')}
        </Button>
      </div>
    </aside>
  )
}
