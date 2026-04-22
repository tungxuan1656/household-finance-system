import { Outlet } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const featureCards = [
  {
    title: 'Quick add',
    description:
      'Capture a transaction in a few seconds with defaults and clear validation.',
  },
  {
    title: 'Household context',
    description:
      'Keep the active household visible across expense, budget, and insight flows.',
  },
  {
    title: 'Shared primitives',
    description:
      'Reuse one form surface for auth, onboarding, and every future settings form.',
  },
] as const

function PublicShell() {
  return (
    <div className='grid min-h-svh gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:p-8'>
      <section className='flex flex-col justify-between rounded-none border border-border/70 bg-background/85 p-6 shadow-sm backdrop-blur sm:p-8'>
        <div className='max-w-xl space-y-6'>
          <Badge className='w-fit' variant='outline'>
            Household finance shell
          </Badge>

          <div className='space-y-3'>
            <h1 className='font-heading text-3xl tracking-tight sm:text-5xl'>
              Track every shared expense without losing context.
            </h1>
            <p className='max-w-prose text-sm leading-6 text-muted-foreground sm:text-base'>
              Sign in, join a household, and move through the MVP flows from one
              stable web shell. The auth pages stay public while the app shell
              keeps onboarding, expenses, budgets, and insights consistent.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            {featureCards.map((card) => (
              <Card key={card.title} size='sm'>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className='mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
          <span>Public routes: /sign-in, /sign-up</span>
          <span>Protected shell: /app</span>
          <span>Redirect: / → /sign-in</span>
        </div>
      </section>

      <main className='flex items-center justify-center'>
        <Outlet />
      </main>
    </div>
  )
}

export { PublicShell }
