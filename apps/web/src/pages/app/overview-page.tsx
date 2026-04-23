import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'

function OverviewPage() {
  const user = useAuthStore.use.user()

  return (
    <div className='space-y-6'>
      <header className='space-y-2'>
        <Badge variant='outline'>{t('app.overview.badge')}</Badge>
        <h1 className='font-heading text-3xl tracking-tight'>
          {t('app.overview.title')}
        </h1>
        <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
          {t('app.overview.description')}
        </p>
        <p className='text-sm text-muted-foreground'>
          {t('app.overview.signedInAs')}{' '}
          <span className='font-medium text-foreground'>
            {user?.displayName ?? t('app.overview.demoFamily')}
          </span>
          {user?.email ? <span> · {user.email}</span> : null}
        </p>
      </header>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>{t('app.overview.activeHousehold.cardTitle')}</CardTitle>
            <CardDescription>
              {t('app.overview.activeHousehold.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <p className='font-medium'>
              {t('app.overview.activeHousehold.name')}
            </p>
            <p className='text-muted-foreground'>
              {t('app.overview.activeHousehold.body')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('app.overview.nextAction.cardTitle')}</CardTitle>
            <CardDescription>
              {t('app.overview.nextAction.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Button asChild variant='outline'>
              <Link to='/app/onboarding'>
                {t('app.overview.nextAction.button')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('app.overview.shellCoverage.cardTitle')}</CardTitle>
            <CardDescription>
              {t('app.overview.shellCoverage.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm text-muted-foreground'>
            <p>{t('app.overview.shellCoverage.body')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { OverviewPage }
