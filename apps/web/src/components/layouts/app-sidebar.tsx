'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APP_MENU_ITEMS } from '@/lib/constants/navigation'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

interface AppSidebarProps {
  onSignOut: () => void
}

export function AppSidebar({ onSignOut }: AppSidebarProps) {
  const pathname = usePathname()

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
          <Link
            key={item.to}
            className={(() => {
              const isActive =
                item.to === PATHS.APP_ROOT
                  ? pathname === item.to
                  : pathname === item.to || pathname.startsWith(`${item.to}/`)

              return [
                'flex items-center gap-2 rounded-none px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            })()}
            href={item.to}>
            <item.icon className='h-4 w-4' />
            {t(item.labelKey)}
          </Link>
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
