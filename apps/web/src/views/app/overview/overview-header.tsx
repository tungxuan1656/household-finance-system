import { Badge } from '@/components/ui/badge'
import { t } from '@/lib/i18n/t'

import { formatPeriodLabel } from './overview-formatters'

type OverviewHeaderProps = {
  name: string | null | undefined
  period: string
}

function OverviewHeader({ name, period }: OverviewHeaderProps) {
  return (
    <header className='space-y-1'>
      <Badge className='text-xs' variant='secondary'>
        {t('app.overview.badge')}
      </Badge>
      <h1 className='font-heading text-xl tracking-tight md:text-2xl'>
        {t('app.overview.welcome', {
          name: name ?? t('app.overview.demoFamily'),
        })}
      </h1>
      <p className='text-sm text-muted-foreground'>
        {t('app.overview.description', { period: formatPeriodLabel(period) })}
      </p>
    </header>
  )
}

export { OverviewHeader }
