import { Badge } from '@/components/ui/badge'
import { t } from '@/lib/i18n/t'

type OverviewHeaderProps = {
  email: string | null | undefined
  name: string | null | undefined
}

function OverviewHeader({ email, name }: OverviewHeaderProps) {
  return (
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
          {name ?? t('app.overview.demoFamily')}
        </span>
        {email ? <span> · {email}</span> : null}
      </p>
    </header>
  )
}

export { OverviewHeader }
