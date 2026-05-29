'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { t } from '@/lib/i18n/t'
import type { AnalyticsGroupsDTO } from '@/types/analytics'
import { formatCurrency } from '@/utils/currency/format'

type InsightsGroupsSectionProps = { data: AnalyticsGroupsDTO }

function InsightsGroupsSection({ data }: InsightsGroupsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('insights.groups.title')}</CardTitle>
        <CardDescription>{t('insights.groups.description')}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        {data.groups.map((group) => (
          <div key={group.groupId} className='flex flex-col gap-2'>
            <div className='flex items-center justify-between gap-3'>
              <span className='truncate text-sm font-medium'>
                {group.groupName}
              </span>
              <div className='flex shrink-0 items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  {group.expenseCount} · {group.overlapPercentOfTotal}%
                </span>
                <span className='font-mono text-sm font-semibold'>
                  {formatCurrency(group.totalSpendMinor, data.currencyCode)}
                </span>
              </div>
            </div>
            <Progress
              className='h-2 rounded-full'
              value={Math.min(group.overlapPercentOfTotal, 100)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { InsightsGroupsSection }
