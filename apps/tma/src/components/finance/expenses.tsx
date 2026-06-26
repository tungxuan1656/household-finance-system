import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
  TmaCategoryIconBadge,
  TmaInlineAction,
} from '@/components/shared/tma-page-shell'
import {
  Chip,
  DataState,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import type { ExpensesRouteState } from '@/features/expenses/filter-store'
import { buildHouseholdNameMap } from '@/features/expenses/presentation'
import { useExpenseListQuery, useHouseholdsQuery } from '@/features/home/api'
import {
  formatCurrencyMinor,
  getExpenseGroupLabel,
  useCategoryPresentation,
} from '@/features/home/presentation'
import type { ExpenseDTO } from '@/features/home/types'
import { getExpenseDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { selection } from '@/lib/telegram/haptics'

export const ExpenseItem = ({
  expense,
  householdLabel,
  showHouseholdLabel = true,
}: {
  expense: ExpenseDTO
  householdLabel?: string | null
  showHouseholdLabel?: boolean
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const category = useCategoryPresentation(expense.categoryKey)
  const groupLabel = getExpenseGroupLabel(expense.groupIds, t)

  const openDetail = () => {
    selection()
    navigate(getExpenseDetailPath(expense.id))
  }

  return (
    <article
      className='flex cursor-pointer items-center gap-3 rounded-3xl bg-tma-card-plain p-3.5 shadow-tma-soft transition active:scale-[0.99]'
      role='button'
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter') openDetail()
      }}>
      <TmaCategoryIconBadge
        accent={category.accent}
        iconUrl={category.iconUrl}
        symbol={category.symbol}
      />
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <h3 className='m-0 truncate text-[15px] leading-tight font-semibold text-tma-text-strong'>
              {category.label}
            </h3>
            <p className='m-0 mt-1 line-clamp-2 text-sm leading-normal font-medium wrap-break-word text-tma-text-muted'>
              {expense.title.trim() || category.label}
            </p>
          </div>
          <MoneyLabel className='shrink-0 pt-0.5 text-base leading-tight font-bold'>
            {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
          </MoneyLabel>
        </div>
        {showHouseholdLabel && householdLabel ? (
          <div className='mt-2 flex flex-wrap gap-1.5'>
            <Chip className='min-h-6 max-w-full px-2 text-[11px]'>
              <span className='truncate'>{householdLabel}</span>
            </Chip>
            {groupLabel ? (
              <Chip className='min-h-6 px-2 text-[11px]'>{groupLabel}</Chip>
            ) : null}
          </div>
        ) : groupLabel ? (
          <div className='mt-2 flex flex-wrap gap-1.5'>
            <Chip className='min-h-6 px-2 text-[11px]'>{groupLabel}</Chip>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export const RecentExpenses = ({
  groupId,
  householdId,
  limit = 10,
  showHouseholdLabel = true,
  title: externalTitle,
  viewAllHref = TMA_PATHS.expenses,
  viewAllState,
  dateFrom,
  dateTo,
}: {
  groupId?: string
  householdId?: string
  limit?: number
  showHouseholdLabel?: boolean
  title?: string
  viewAllHref?: string
  viewAllState?: ExpensesRouteState
  dateFrom?: number
  dateTo?: number
}) => {
  const { t } = useTranslation()
  const title = externalTitle ?? t('expensesList.defaultTitle')
  const recentExpensesQuery = useExpenseListQuery({
    group_id: groupId,
    household_id: householdId,
    limit,
    sort: 'occurred_at_desc',
    ...(dateFrom != null ? { date_from: dateFrom } : {}),
    ...(dateTo != null ? { date_to: dateTo } : {}),
  })
  const householdsQuery = useHouseholdsQuery()
  const householdNameById = buildHouseholdNameMap(
    householdsQuery.data?.items ?? [],
  )
  const recentExpenses = recentExpensesQuery.data?.items ?? []

  return (
    <Section>
      <SectionHeader
        action={
          <TmaInlineAction href={viewAllHref} state={viewAllState}>
            {t('expensesList.viewAll')}
          </TmaInlineAction>
        }
        title={title}
      />
      <DataState
        emptyDescription={t('expensesList.emptyDesc')}
        emptyTitle={t('expensesList.emptyTitle')}
        errorDescription={t('expensesList.loadErrorDesc')}
        errorTitle={t('expensesList.loadError')}
        isEmpty={
          !recentExpensesQuery.isLoading &&
          recentExpenses.length === 0 &&
          !recentExpensesQuery.isError
        }
        isError={recentExpensesQuery.isError && recentExpenses.length === 0}
        isLoading={recentExpensesQuery.isLoading && recentExpenses.length === 0}
        loadingDescription={t('expensesList.loadingDesc')}
        loadingTitle={t('expensesList.loading')}
        retryAction={recentExpensesQuery.refetch}>
        <div className='grid gap-2'>
          {recentExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              householdLabel={
                expense.householdId
                  ? householdNameById.get(expense.householdId)
                  : null
              }
              showHouseholdLabel={showHouseholdLabel}
            />
          ))}
        </div>
      </DataState>
    </Section>
  )
}

export const ExpenseTimeline = ({
  expenses,
  householdNameById,
}: {
  expenses: ExpenseDTO[]
  householdNameById: Map<string, string>
}) => {
  const sections = new Map<string, ExpenseDTO[]>()

  for (const expense of expenses) {
    const label = formatDateLabel(new Date(expense.occurredAt).toISOString())
    sections.set(label, [...(sections.get(label) ?? []), expense])
  }

  return (
    <section className='grid gap-5'>
      {[...sections.entries()].map(([label, items]) => (
        <div key={label} className='grid gap-2.5'>
          <h2 className='m-0 px-1 text-base leading-tight font-bold text-tma-text-strong'>
            {label}
          </h2>
          <div className='grid gap-2'>
            {items.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                householdLabel={
                  expense.householdId
                    ? householdNameById.get(expense.householdId)
                    : null
                }
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
