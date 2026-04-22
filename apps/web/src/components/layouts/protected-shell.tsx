import { NavLink, Outlet } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'

const appNavItems = [
  { to: '/app', label: 'Overview' },
  { to: '/app/onboarding', label: 'Onboarding' },
  { to: '/app/expenses', label: 'Expenses' },
  { to: '/app/budgets', label: 'Budgets' },
  { to: '/app/insights', label: 'Insights' },
  { to: '/app/settings', label: 'Settings' },
] as const

function ProtectedShell() {
  return (
    <div className='min-h-svh p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto grid min-h-[calc(100svh-2rem)] max-w-7xl gap-4 lg:grid-cols-[240px_minmax(0,1fr)]'>
        <aside className='flex flex-col gap-4 rounded-none border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur'>
          <div className='space-y-2'>
            <Badge className='w-fit' variant='secondary'>
              Protected shell
            </Badge>

            <div>
              <h2 className='font-heading text-lg'>Shell navigation</h2>
              <p className='text-xs text-muted-foreground'>
                A stable frame for authenticated routes and onboarding.
              </p>
            </div>
          </div>

          <nav aria-label='App sections' className='flex flex-col gap-1'>
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
                to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className='mt-auto rounded-none border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground'>
            Auth state and household selection will plug in here in later feats.
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
