import { t } from '@/lib/i18n/t'
import type { HouseholdDTO } from '@/types/household'

import { HouseholdOverviewCard } from './overview-household-card'

type OverviewHouseholdsSectionProps = {
  households: HouseholdDTO[]
}

function OverviewHouseholdsSection({
  households,
}: OverviewHouseholdsSectionProps) {
  return (
    <section className='space-y-3'>
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold'>
          {t('app.overview.households.title')}
        </h2>
        <p className='text-sm text-muted-foreground'>
          {t('app.overview.households.description')}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {households.map((household) => (
          <HouseholdOverviewCard key={household.id} household={household} />
        ))}
      </div>
    </section>
  )
}

export { OverviewHouseholdsSection }
