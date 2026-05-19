import type { ExpenseGroupDTO } from '@/types/group'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

export type ExpenseEntryCategoryOption = ReferenceCategoryDTO & {
  kind: 'expense'
}

export type ExpenseEntryHouseholdOption = {
  id: string
  name: string
}

export const filterExpenseEntryCategories = (
  categories: ReferenceCategoryDTO[],
): ExpenseEntryCategoryOption[] =>
  categories.filter(
    (category): category is ExpenseEntryCategoryOption =>
      category.kind === 'expense',
  )

export const mergeExpenseEntryGroups = (
  personalGroups: ExpenseGroupDTO[],
  householdGroups: ExpenseGroupDTO[],
) => [
  ...new Map(
    [...personalGroups, ...householdGroups].map((group) => [group.id, group]),
  ).values(),
]
