'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { t } from '@/lib/i18n/t'

type Lens =
  | { type: 'personal' }
  | { type: 'household'; householdId: string; householdName: string }
type OverviewTabsProps = {
  lenses: Lens[]
  value: string
  onValueChange: (value: string) => void
}

function OverviewTabs({ lenses, value, onValueChange }: OverviewTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        {lenses.map((lens) => (
          <TabsTrigger
            key={lens.type === 'personal' ? 'personal' : lens.householdId}
            value={lens.type === 'personal' ? 'personal' : lens.householdId}>
            {lens.type === 'personal'
              ? t('app.overview.lenses.personal')
              : lens.householdName}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent className='mt-0' value='personal' />
      {lenses
        .filter(
          (lens): lens is Extract<Lens, { type: 'household' }> =>
            lens.type === 'household',
        )
        .map((lens) => (
          <TabsContent
            key={lens.householdId}
            className='mt-0'
            value={lens.householdId}
          />
        ))}
    </Tabs>
  )
}

export type { Lens, OverviewTabsProps }
export { OverviewTabs }
