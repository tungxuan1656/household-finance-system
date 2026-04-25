import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n'

function MorePage() {
  return (
    <div className='flex flex-col gap-4'>
      <header className='flex flex-col gap-1'>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('app.more.title')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('app.more.description')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('app.more.quickLinks.title')}</CardTitle>
          <CardDescription>
            {t('app.more.quickLinks.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2'>
          <Button asChild className='justify-start' variant='outline'>
            <Link to={PATHS.HOUSEHOLDS}>{t('app.more.links.households')}</Link>
          </Button>
          <Button asChild className='justify-start' variant='outline'>
            <Link to={PATHS.SETTINGS}>{t('app.more.links.settings')}</Link>
          </Button>
          <Button asChild className='justify-start' variant='outline'>
            <Link to={PATHS.ONBOARDING}>{t('app.more.links.onboarding')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export { MorePage }
