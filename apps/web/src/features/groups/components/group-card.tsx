'use client'

import { Archive, Edit, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import { formatCurrency } from '@/utils/currency/format'
import { DATE_TIME_FORMATS } from '@/utils/datetime/constants'
import { formatDate } from '@/utils/datetime/format'
import { statusLabel } from '@/utils/household/status-label'

type GroupCardProps = {
  group: ExpenseGroupDTO
  onEdit?: () => void
  onArchive?: () => void
}

function GroupCard({ group, onEdit, onArchive }: GroupCardProps) {
  const router = useRouter()
  const hasBudget = group.eventBudgetMinor != null && group.eventBudgetMinor > 0
  const spendRatio = hasBudget
    ? Math.min((group.totalSpendMinor / group.eventBudgetMinor!) * 100, 100)
    : 0
  const isOverBudget =
    hasBudget && group.totalSpendMinor > group.eventBudgetMinor!
  const startDateStr = formatDate(group.startDate, DATE_TIME_FORMATS.date)
  const endDateStr = formatDate(group.endDate, DATE_TIME_FORMATS.date)

  return (
    <Card
      className='cursor-pointer'
      onClick={() => router.push(`/groups/${group.id}`)}>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <CardTitle>{group.name}</CardTitle>
            {group.description && (
              <CardDescription className='line-clamp-2'>
                {group.description}
              </CardDescription>
            )}
          </div>
          <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
            {statusLabel(group.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {startDateStr && endDateStr && (
          <p className='text-sm text-muted-foreground'>
            {startDateStr} - {endDateStr}
          </p>
        )}
        {hasBudget ? (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              {t('groups.card.spentLabel')}:{' '}
              {formatCurrency(group.totalSpendMinor, 'VND')}
            </span>
            <span className='text-sm text-muted-foreground'>
              {t('groups.card.budgetLabel')}:{' '}
              {formatCurrency(group.eventBudgetMinor!, 'VND')}
            </span>
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>
            {t('groups.card.noBudget')}
          </p>
        )}
        {hasBudget && (
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${spendRatio}%` }}
            />
          </div>
        )}
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            type='button'
            variant='outline'
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/groups/${group.id}`)
            }}>
            <Eye data-icon='inline-start' />
            {t('groups.actions.viewDetail')}
          </Button>
          {onEdit && (
            <Button
              size='sm'
              type='button'
              variant='outline'
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}>
              <Edit data-icon='inline-start' />
              {t('common.actions.edit')}
            </Button>
          )}
          {onArchive && group.status === 'active' && (
            <Button
              size='sm'
              type='button'
              variant='outline'
              onClick={(e) => {
                e.stopPropagation()
                onArchive()
              }}>
              <Archive data-icon='inline-start' />
              {t('groups.actions.archive')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { GroupCard }
