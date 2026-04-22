import { NavLink, Outlet } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { t } from '@/lib/i18n'

const appNavItems = [
  { to: '/app', label: t('shell.protected.nav.overview') },
  { to: '/app/onboarding', label: t('shell.protected.nav.onboarding') },
  { to: '/app/expenses', label: t('shell.protected.nav.expenses') },
  { to: '/app/budgets', label: t('shell.protected.nav.budgets') },
  { to: '/app/insights', label: t('shell.protected.nav.insights') },
  { to: '/app/settings', label: t('shell.protected.nav.settings') },
] as const

function ProtectedShell() {
  return (
    <div className='min-h-svh p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto grid min-h-[calc(100svh-2rem)] max-w-7xl gap-4 lg:grid-cols-[240px_minmax(0,1fr)]'>
        <aside className='flex flex-col gap-4 rounded-none border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur'>
          <div className='space-y-2'>
            <Badge className='w-fit' variant='secondary'>
              {t('shell.protected.badge')}
            </Badge>

            <div>
              <h2 className='font-heading text-lg'>
                {t('shell.protected.title')}
              </h2>
              <p className='text-xs text-muted-foreground'>
                {t('shell.protected.description')}
              </p>
            </div>
          </div>

          <nav
            aria-label={t('shell.protected.nav.ariaLabel')}
            className='flex flex-col gap-1'>
            {appNavItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-none px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')
                }
                end={item.to === '/app'}
                to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className='mt-auto rounded-none border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground'>
            {t('shell.protected.footer')}
          </div>
        </aside>

        <section className='space-y-4 rounded-none border border-border/70 bg-background/85 p-5 shadow-sm backdrop-blur sm:p-6'>
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export { ProtectedShell }
