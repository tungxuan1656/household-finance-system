import { SummaryRow } from '@/components/shared/summary-row'
import { TmaCategoryIconBadge } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { ExpenseCategorySelection } from '@/features/expenses/model/store'
import type { ExpenseGroupDTO } from '@/features/groups/types'
import type { HouseholdDTO } from '@/features/home/types'
import { formatDateLabel, formatVnd } from '@/lib/formatters'

type AddExpenseContextPreviewCardProps = {
  category: ExpenseCategorySelection
  date: string
  amount: number
  title: string
  selectedSource: { label: string } | null
  selectedHousehold?: HouseholdDTO
  selectedGroup: ExpenseGroupDTO | null
  selectedGroupLabel: string | null
  t: (key: string, options?: Record<string, unknown>) => string
}

export const AddExpenseContextPreviewCard = ({
  category,
  date,
  amount,
  title,
  selectedSource,
  selectedHousehold,
  selectedGroup,
  selectedGroupLabel,
  t,
}: AddExpenseContextPreviewCardProps) => (
  <Card size='sm'>
    <CardHeader className='pb-3'>
      <div className='flex items-center gap-3'>
        <TmaCategoryIconBadge
          accent={category.accent}
          iconUrl={category.iconUrl}
          symbol={category.symbol}
        />
        <div className='min-w-0 flex-1'>
          <CardTitle className='truncate'>{category.label}</CardTitle>
          <CardDescription className='truncate'>
            {formatDateLabel(date)} ·{' '}
            <span className='font-mono text-foreground [font-variant-numeric:tabular-nums]'>
              {formatVnd(amount)}
            </span>
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className='grid gap-2.5'>
      <Separator />
      <div className='grid min-w-0 gap-1'>
        <CardDescription>{t('expenses.add.expenseName')}</CardDescription>
        <p className='truncate text-base font-semibold text-foreground'>
          {title.trim() || t('expenses.add.nameUnset')}
        </p>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='min-w-0 [&_strong]:block [&_strong]:truncate'>
          <SummaryRow
            label={t('expenses.add.source')}
            value={selectedSource?.label ?? t('expenses.add.sourceUnset')}
          />
        </div>
        <div className='min-w-0 [&_strong]:block [&_strong]:truncate'>
          <SummaryRow
            label={t('expenses.add.contextHousehold')}
            value={selectedHousehold?.name ?? t('expenses.add.contextPersonal')}
          />
        </div>
        <div className='min-w-0 [&_strong]:block [&_strong]:truncate'>
          <SummaryRow
            label={t('expenses.add.contextGroup')}
            value={
              selectedGroup
                ? selectedGroup.name
                : t('expenses.edit.optionUngrouped')
            }
          />
        </div>
        <div className='min-w-0 [&_strong]:block [&_strong]:truncate'>
          <SummaryRow
            label={t('expenses.add.contextGroupLabel')}
            value={selectedGroupLabel ?? t('expenses.add.contextPersonal')}
          />
        </div>
      </div>
    </CardContent>
  </Card>
)
