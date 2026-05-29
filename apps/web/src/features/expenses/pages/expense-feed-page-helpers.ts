import type { ExpenseFeedFilterValues } from '@/features/expenses/components/expense-feed-filters'
import type {
  ExpenseDTO,
  ExpenseListParams,
} from '@/features/expenses/types/expense'
import type { ExpenseGroupDTO } from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ReferenceCategoryDTO } from '@/types/reference-data'
import { parseAmountInput } from '@/utils/currency/format'
import { formatDate, formatRelativeDate } from '@/utils/datetime/format'
import { localDateToTimestamp } from '@/utils/datetime/helpers'

export const DEFAULT_EXPENSE_FEED_FILTER_VALUES: ExpenseFeedFilterValues = {
  amountMax: '',
  amountMin: '',
  categoryKey: '',
  dateFrom: '',
  dateTo: '',
  groupId: '',
  search: '',
  sort: 'occurred_at_desc',
  householdId: '',
}

const END_OF_DAY_OFFSET_MS = 24 * 60 * 60 * 1000 - 1

const getDateFilterFrom = (value: string): number | undefined => {
  if (!value) return undefined

  const timestamp = localDateToTimestamp(value)

  return Number.isNaN(timestamp) ? undefined : timestamp
}

const getDateFilterTo = (value: string): number | undefined => {
  if (!value) return undefined

  const timestamp = localDateToTimestamp(value)

  return Number.isNaN(timestamp) ? undefined : timestamp + END_OF_DAY_OFFSET_MS
}

export const getExpenseFeedCategories = (
  items: ReferenceCategoryDTO[],
): ReferenceCategoryDTO[] => items.filter((item) => item.kind === 'expense')

export const mergeExpenseFeedGroups = (
  personalGroups: ExpenseGroupDTO[],
  householdGroups: ExpenseGroupDTO[],
): ExpenseGroupDTO[] => {
  const dedupedGroups = new Map<string, ExpenseGroupDTO>()

  for (const group of [...personalGroups, ...householdGroups]) {
    dedupedGroups.set(group.id, group)
  }

  return [...dedupedGroups.values()]
}

export const buildExpenseFeedFilters = ({
  values,
  debouncedAmountMax,
  debouncedAmountMin,
}: {
  values: ExpenseFeedFilterValues
  debouncedAmountMin: string
  debouncedAmountMax: string
}): ExpenseListParams => ({
  amount_max: parseAmountInput(debouncedAmountMax),
  amount_min: parseAmountInput(debouncedAmountMin),
  category_key: values.categoryKey || undefined,
  date_from: getDateFilterFrom(values.dateFrom),
  date_to: getDateFilterTo(values.dateTo),
  group_id: values.groupId || undefined,
  household_id: values.householdId || undefined,
  sort: values.sort || undefined,
})

export const buildExpenseFeedActiveFilterLabels = ({
  groups,
  households,
  selectedCategory,
  values,
}: {
  values: ExpenseFeedFilterValues
  groups: ExpenseGroupDTO[]
  households: Array<{ id: string; name: string }>
  selectedCategory?: ReferenceCategoryDTO
}): string[] =>
  [
    households.find((h) => h.id === values.householdId)?.name ?? null,
    selectedCategory ? getCategoryLabel(selectedCategory.key) : null,
    values.sort === 'amount_desc'
      ? t('expense.feed.filters.sortHighestAmount')
      : null,
    values.dateFrom
      ? `${t('expense.feed.filters.dateFrom')}: ${values.dateFrom}`
      : null,
    values.dateTo
      ? `${t('expense.feed.filters.dateTo')}: ${values.dateTo}`
      : null,
    values.amountMin
      ? `${t('expense.feed.filters.amountMin')}: ${values.amountMin}`
      : null,
    values.amountMax
      ? `${t('expense.feed.filters.amountMax')}: ${values.amountMax}`
      : null,
    groups.find((group) => group.id === values.groupId)?.name ?? null,
  ].filter((value): value is string => Boolean(value))

export type ExpenseTimelineGroup = {
  label: string
  items: ExpenseDTO[]
}

export const buildExpenseTimelineGroups = (
  expenses: ExpenseDTO[],
): ExpenseTimelineGroup[] => {
  const groupedExpenses = new Map<string, ExpenseTimelineGroup>()

  for (const expense of expenses) {
    const dayKey = formatDate(expense.occurredAt, 'yyyy-MM-dd') ?? 'unknown'
    const dateLabel = formatRelativeDate(expense.occurredAt)
    const fullDate = formatDate(expense.occurredAt, 'dd/MM')
    const label = `${dateLabel} · ${fullDate}`

    const currentGroup = groupedExpenses.get(dayKey)

    if (currentGroup) {
      currentGroup.items.push(expense)
      continue
    }

    groupedExpenses.set(dayKey, {
      label,
      items: [expense],
    })
  }

  return [...groupedExpenses.values()]
}
