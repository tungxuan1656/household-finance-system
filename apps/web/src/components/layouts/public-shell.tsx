import { Outlet } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n'

const featureCards = [
  {
    description: t('shell.public.featureCards.quickAdd.description'),
    title: t('shell.public.featureCards.quickAdd.title'),
  },
  {
    description: t('shell.public.featureCards.householdContext.description'),
    title: t('shell.public.featureCards.householdContext.title'),
  },
  {
    description: t('shell.public.featureCards.sharedPrimitives.description'),
    title: t('shell.public.featureCards.sharedPrimitives.title'),
  },
] as const

function PublicShell() {
  return (
    <div className='grid min-h-svh gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:p-8'>
      <section className='flex flex-col justify-between rounded-none border border-border/70 bg-background/85 p-6 shadow-sm backdrop-blur sm:p-8'>
        <div className='max-w-xl space-y-6'>
          <Badge className='w-fit' variant='outline'>
            {t('shell.public.badge')}
          </Badge>

          <div className='space-y-3'>
            <h1 className='font-heading text-3xl tracking-tight sm:text-5xl'>
              {t('shell.public.title')}
            </h1>
            <p className='max-w-prose text-sm leading-6 text-muted-foreground sm:text-base'>
              {t('shell.public.description')}
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
          <span>{t('shell.public.footer.publicRoutes')}</span>
          <span>{t('shell.public.footer.protectedShell')}</span>
          <span>{t('shell.public.footer.redirect')}</span>
        </div>
      </section>

      <main className='flex items-center justify-center'>
        <Outlet />
      </main>
    </div>
  )
}

export { PublicShell }
