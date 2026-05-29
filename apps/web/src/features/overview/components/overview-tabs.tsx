'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { t } from '@/lib/i18n/t'

type View =
  | { type: 'personal' }
  | { type: 'household'; householdId: string; householdName: string }

type OverviewTabsProps = {
  views: View[]
  value: string
  onValueChange: (value: string) => void
}

function OverviewTabs({ views, value, onValueChange }: OverviewTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        {views.map((view) => (
          <TabsTrigger
            key={view.type === 'personal' ? 'personal' : view.householdId}
            value={view.type === 'personal' ? 'personal' : view.householdId}>
            {view.type === 'personal'
              ? t('app.overview.views.personal')
              : view.householdName}
          </TabsTrigger>
        ))}
      </TabsList>
      {views
        .filter(
          (view): view is Extract<View, { type: 'household' }> =>
            view.type === 'household',
        )
        .map((view) => (
          <TabsContent
            key={view.householdId}
            className='mt-4'
            value={view.householdId}>
            <p className='text-sm text-muted-foreground'>
              {t('app.overview.views.householdContext', {
                name: view.householdName,
              })}
            </p>
          </TabsContent>
        ))}
    </Tabs>
  )
}

export { OverviewTabs }
export type { OverviewTabsProps, View }
