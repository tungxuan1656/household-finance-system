import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

export const HouseholdDetailHeader = () => (
  <section className='flex flex-wrap items-center justify-between gap-3'>
    <div className='flex flex-col gap-1'>
      <p className='text-sm text-muted-foreground'>
        {t('app.householdDetail.description')}
      </p>
    </div>
    <Button asChild variant='outline'>
      <Link href={PATHS.HOUSEHOLDS}>
        {t('app.householdDetail.actions.back')}
      </Link>
    </Button>
  </section>
)
