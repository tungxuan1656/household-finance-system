import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

export const HouseholdDetailHeader = () => (
  <header className='flex flex-wrap items-center justify-between gap-3'>
    <div className='flex flex-col gap-1'>
      <h1 className='font-heading text-2xl tracking-tight'>
        {t('app.householdDetail.title')}
      </h1>
      <p className='text-sm text-muted-foreground'>
        {t('app.householdDetail.description')}
      </p>
    </div>
    <Button asChild variant='outline'>
      <Link href={PATHS.HOUSEHOLDS}>
        {t('app.householdDetail.actions.back')}
      </Link>
    </Button>
  </header>
)
