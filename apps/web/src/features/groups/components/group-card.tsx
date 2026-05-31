'use client'

import { Archive, Edit, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const shouldIgnoreNextCardClickRef = useRef(false)
  const hasBudget = group.eventBudgetMinor != null && group.eventBudgetMinor > 0
  const spendRatio = hasBudget
    ? Math.min((group.totalSpendMinor / group.eventBudgetMinor!) * 100, 100)
    : 0
  const isOverBudget =
    hasBudget && group.totalSpendMinor > group.eventBudgetMinor!
  const startDateStr = formatDate(group.startDate, DATE_TIME_FORMATS.date)
  const endDateStr = formatDate(group.endDate, DATE_TIME_FORMATS.date)

  const blockCardNavigation = () => {
    shouldIgnoreNextCardClickRef.current = true

    window.setTimeout(() => {
      shouldIgnoreNextCardClickRef.current = false
    }, 0)
  }

  return (
    <Card
      className='cursor-pointer'
      onClick={() => {
        if (shouldIgnoreNextCardClickRef.current) {
          return
        }

        router.push(`/groups/${group.id}`)
      }}>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex min-w-0 flex-col gap-1'>
            <CardTitle>{group.name}</CardTitle>
            {group.description && (
              <CardDescription className='line-clamp-2'>
                {group.description}
              </CardDescription>
            )}
          </div>
          <Badge
            className='shrink-0'
            variant={group.status === 'active' ? 'default' : 'secondary'}>
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
          <div className='flex min-w-0 items-center justify-between gap-3'>
            <span className='min-w-0 truncate text-sm text-muted-foreground'>
              {t('groups.card.spentLabel')}:{' '}
              {formatCurrency(group.totalSpendMinor, 'VND')}
            </span>
            <span className='shrink-0 text-sm text-muted-foreground'>
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
        {onEdit || (onArchive && group.status === 'active') ? (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={t('shell.protected.nav.more')}
                  size='icon-sm'
                  type='button'
                  variant='outline'
                  onClick={(event) => {
                    event.stopPropagation()
                    blockCardNavigation()
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    blockCardNavigation()
                  }}>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-44'
                onClick={(event) => {
                  event.stopPropagation()
                  blockCardNavigation()
                }}
                onCloseAutoFocus={(event) => {
                  event.preventDefault()
                  blockCardNavigation()
                }}>
                {onEdit ? (
                  <DropdownMenuItem
                    onSelect={() => {
                      blockCardNavigation()
                      onEdit()
                    }}>
                    <Edit className='size-4' />
                    {t('common.actions.edit')}
                  </DropdownMenuItem>
                ) : null}
                {onArchive && group.status === 'active' ? (
                  <DropdownMenuItem
                    onSelect={() => {
                      blockCardNavigation()
                      onArchive()
                    }}>
                    <Archive className='size-4' />
                    {t('groups.actions.archive')}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { GroupCard }
