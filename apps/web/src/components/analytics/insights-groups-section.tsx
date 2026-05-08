'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { t } from '@/lib/i18n/t'
import type { AnalyticsGroupsDTO } from '@/types/analytics'

type InsightsGroupsSectionProps = {
  data: AnalyticsGroupsDTO
  formatCurrency: (amount: number, currencyCode: string) => string
}

function InsightsGroupsSection({
  data,
  formatCurrency,
}: InsightsGroupsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('insights.groups.title')}</CardTitle>
        <CardDescription>{t('insights.groups.description')}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {data.groups.map((group) => (
          <div
            key={group.groupId}
            className='flex items-center justify-between gap-4 rounded-lg border p-3'>
            <div className='flex min-w-0 flex-col gap-1'>
              <span className='truncate'>{group.groupName}</span>
              <span className='text-sm text-muted-foreground'>
                {group.expenseCount} · {group.overlapPercentOfTotal}%{' '}
                {t('insights.groups.overlapShareLabel')}
              </span>
            </div>
            <span className='min-w-0 font-medium break-words'>
              {formatCurrency(group.totalSpendMinor, data.currencyCode)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { InsightsGroupsSection }
