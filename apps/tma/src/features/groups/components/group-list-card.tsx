import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrencyMinor } from '@/features/home/presentation'
import { getGroupDetailPath } from '@/lib/constants/routes'
import { impact } from '@/lib/telegram/haptics'

import {
  getGroupBudgetLabel,
  getGroupContextLabel,
  getGroupDateRangeLabel,
  getGroupProgress,
  getGroupStatusLabel,
} from '../presentation'
import type { GroupListItem } from '../types'
import { GroupGlyph } from './group-glyph'

const GroupStats = ({ item }: { item: GroupListItem }) => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-2 gap-3'>
      <div className='grid gap-1'>
        <CardDescription>{t('groups.statSpent')}</CardDescription>
        <span className='text-sm font-bold text-foreground tabular-nums'>
          {formatCurrencyMinor(item.group.totalSpendMinor, 'VND')}
        </span>
      </div>
      <div className='grid gap-1'>
        <CardDescription>{t('groups.statBudget')}</CardDescription>
        <p className='text-sm font-semibold text-foreground tabular-nums'>
          {getGroupBudgetLabel(item.group, t)}
        </p>
      </div>
    </div>
  )
}

const GroupProgressBar = ({
  progress,
}: {
  progress: NonNullable<ReturnType<typeof getGroupProgress>>
}) => {
  const { t } = useTranslation()

  return (
    <div className='grid gap-1.5'>
      <div className='h-2 overflow-hidden rounded-full bg-muted'>
        <div
          className={
            progress.isOverBudget
              ? 'h-full rounded-full bg-destructive'
              : 'h-full rounded-full bg-primary'
          }
          style={{ width: `${progress.widthPercent}%` }}
        />
      </div>
      <CardDescription className='text-xs'>
        {t('groups.statBudgetUsedPct', { percent: progress.percentUsed })}
      </CardDescription>
    </div>
  )
}

export const GroupListCard = ({ item }: { item: GroupListItem }) => {
  const { t } = useTranslation()
  const progress = getGroupProgress(
    item.group.totalSpendMinor,
    item.group.eventBudgetMinor,
  )

  return (
    <Link
      className='block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
      to={getGroupDetailPath(item.group.id)}
      onClick={() => impact('light')}>
      <Card
        className='transition-colors hover:bg-muted/40 active:scale-[0.995] active:bg-muted/60'
        size='sm'>
        <CardHeader className='gap-3'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <GroupGlyph />
            </div>
            <Badge
              variant={
                item.group.status === 'active' ? 'secondary' : 'outline'
              }>
              {getGroupStatusLabel(item.group.status, t)}
            </Badge>
          </div>
          <div className='grid min-w-0 gap-1'>
            <CardTitle className='truncate text-base font-bold tracking-tight normal-case'>
              {item.group.name}
            </CardTitle>
            <CardDescription className='line-clamp-2'>
              {item.group.description || getGroupContextLabel(item, t)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className='grid gap-3'>
          <GroupStats item={item} />
          {progress ? <GroupProgressBar progress={progress} /> : null}
          <div className='flex items-center justify-between gap-3 text-xs text-muted-foreground'>
            <span className='min-w-0 truncate'>
              {getGroupContextLabel(item, t)}
            </span>
            <span className='shrink-0 tabular-nums'>
              {getGroupDateRangeLabel(item.group, t)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
