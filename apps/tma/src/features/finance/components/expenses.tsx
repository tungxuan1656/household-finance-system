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
import { buildHouseholdNameMap } from '@/features/expenses/presentation'
import {
  useExpenseListQuery,
  useHouseholdsQuery,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
  getExpenseGroupLabel,
} from '@/features/home/presentation'
import type { ExpenseDTO, ReferenceCategoryDTO } from '@/features/home/types'
import { getExpenseDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { selection } from '@/lib/telegram/haptics'

export const ExpenseItem = ({
  expense,
  householdLabel,
  referenceCategories,
  showHouseholdLabel = true,
}: {
  expense: ExpenseDTO
  householdLabel?: string | null
  referenceCategories?: ReferenceCategoryDTO[]
  showHouseholdLabel?: boolean
}) => {
  const navigate = useNavigate()
  const category = getCategoryPresentation(
    expense.categoryKey,
    referenceCategories,
  )
  const groupLabel = getExpenseGroupLabel(expense.groupIds)

  const openDetail = () => {
    selection()
    navigate(getExpenseDetailPath(expense.id))
  }

  return (
    <article
      className='flex cursor-pointer items-center gap-3 rounded-3xl bg-tma-card-plain p-4 shadow-tma-soft transition active:scale-[0.99]'
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
            <h3 className='m-0 truncate text-[15px] leading-tight font-bold text-tma-text-strong'>
              {category.label}
            </h3>
            <p className='m-0 mt-1 truncate text-sm leading-normal font-medium text-tma-text-muted'>
              {expense.title.trim() || category.label}
            </p>
          </div>
          <MoneyLabel className='shrink-0 pt-0.5 text-[15px] leading-tight font-extrabold'>
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
  title = 'Lịch sử gần đây',
  viewAllHref = TMA_PATHS.expenses,
}: {
  groupId?: string
  householdId?: string
  limit?: number
  showHouseholdLabel?: boolean
  title?: string
  viewAllHref?: string
}) => {
  const recentExpensesQuery = useExpenseListQuery({
    group_id: groupId,
    household_id: householdId,
    limit,
    sort: 'occurred_at_desc',
  })
  const householdsQuery = useHouseholdsQuery()
  const referenceCategoriesQuery = useReferenceCategoriesQuery()
  const householdNameById = buildHouseholdNameMap(
    householdsQuery.data?.items ?? [],
  )
  const recentExpenses = recentExpensesQuery.data?.items ?? []

  return (
    <Section>
      <SectionHeader
        action={
          <TmaInlineAction href={viewAllHref}>Xem tất cả</TmaInlineAction>
        }
        title={title}
      />
      <DataState
        emptyDescription='Tạo giao dịch mới để danh sách này hiện dữ liệu thật.'
        emptyTitle='Chưa có chi tiêu gần đây'
        errorDescription='API chi tiêu đang lỗi hoặc phiên hiện tại chưa thấy dữ liệu.'
        errorTitle='Không tải được lịch sử chi tiêu'
        isEmpty={
          !recentExpensesQuery.isLoading &&
          recentExpenses.length === 0 &&
          !recentExpensesQuery.isError
        }
        isError={recentExpensesQuery.isError && recentExpenses.length === 0}
        isLoading={recentExpensesQuery.isLoading && recentExpenses.length === 0}
        loadingDescription='Danh sách sẽ xuất hiện ngay khi truy vấn đầu tiên hoàn tất.'
        loadingTitle='Đang tải lịch sử chi tiêu'
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
              referenceCategories={referenceCategoriesQuery.data?.items}
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
  referenceCategories,
}: {
  expenses: ExpenseDTO[]
  householdNameById: Map<string, string>
  referenceCategories?: ReferenceCategoryDTO[]
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
          <h2 className='m-0 px-1 text-xl leading-tight font-extrabold text-tma-text-strong'>
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
                referenceCategories={referenceCategories}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
