import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import {
  TmaCategoryIconBadge,
  TmaInlineAction,
} from '@/components/shared/tma-page-shell'
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
      className='flex cursor-pointer items-center gap-3 rounded-3xl bg-card p-3.5 shadow-sm transition active:scale-[0.99]'
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
            <h3 className='m-0 truncate text-[15px] leading-tight font-semibold text-foreground'>
              {category.label}
            </h3>
            <p className='m-0 mt-1 line-clamp-2 text-sm leading-normal font-medium wrap-break-word text-muted-foreground'>
              {expense.title.trim() || category.label}
            </p>
          </div>
          <span className='shrink-0 pt-0.5 font-mono text-base leading-tight font-bold text-foreground [font-variant-numeric:tabular-nums]'>
            {formatCurrencyMinor(expense.amountMinor, expense.currencyCode)}
          </span>
        </div>
        {showHouseholdLabel && householdLabel ? (
          <div className='mt-2 flex flex-wrap gap-1.5'>
            <span className='inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full bg-muted px-2 text-[11px] font-semibold text-foreground'>
              <span className='truncate'>{householdLabel}</span>
            </span>
            {groupLabel ? (
              <span className='inline-flex min-h-6 items-center gap-1.5 rounded-full bg-muted px-2 text-[11px] font-semibold text-foreground'>
                {groupLabel}
              </span>
            ) : null}
          </div>
        ) : groupLabel ? (
          <div className='mt-2 flex flex-wrap gap-1.5'>
            <span className='inline-flex min-h-6 items-center gap-1.5 rounded-full bg-muted px-2 text-[11px] font-semibold text-foreground'>
              {groupLabel}
            </span>
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
    <section className='mt-6'>
      <div className='mb-3 flex items-end justify-between gap-3'>
        <h2 className='m-0 min-w-0 text-base leading-tight font-semibold text-foreground'>
          {title}
        </h2>
        <div className='shrink-0'>
          <TmaInlineAction href={viewAllHref} state={viewAllState}>
            {t('expensesList.viewAll')}
          </TmaInlineAction>
        </div>
      </div>
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
    </section>
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
          <h2 className='m-0 px-1 text-base leading-tight font-bold text-foreground'>
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
