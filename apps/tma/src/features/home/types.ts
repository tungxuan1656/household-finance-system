export const CATEGORY_KEYS = [
  'food',
  'transport',
  'dating',
  'living-costs',
  'family',
  'children',
  'relatives',
  'shopping',
  'beauty',
  'health',
  'social',
  'repairs',
  'work',
  'education',
  'investment',
  'self-development',
  'sports',
  'travel',
  'hobbies',
  'pets',
  'money-in',
  'lending',
  'charity',
  'other',
] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export const SOURCE_KEYS = [
  'cash',
  'bank-transfer',
  'card',
  'momo',
  'zalo-pay',
  'shopee-pay',
  'other',
] as const

export type SourceKey = (typeof SOURCE_KEYS)[number]

export type ReferenceCategoryDTO = {
  key: CategoryKey
  kind: 'expense' | 'income' | 'transfer'
  iconUrl: string
  color: string
}

export type ListReferenceCategoriesResponse = {
  items: ReferenceCategoryDTO[]
}

export type HouseholdRoleDTO = 'admin' | 'member'

export type HouseholdDTO = {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  defaultCurrencyCode: string
  timezone: string
  role: HouseholdRoleDTO
  createdAt: number
}

export type HouseholdMemberDTO = {
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  role: HouseholdRoleDTO
  joinedAt: number
}

export type ListHouseholdsResponse = {
  items: HouseholdDTO[]
}

export type ListHouseholdMembersResponse = {
  items: HouseholdMemberDTO[]
}

export type ExpenseDTO = {
  id: string
  amountMinor: number
  currencyCode: string
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note: string | null
  householdId: string | null
  spentByUserId: string
  groupIds?: string[]
  createdAt: number
  updatedAt: number
}

export type ExpenseListParams = {
  cursor?: string
  limit?: number
  household_id?: string
  group_id?: string
  date_from?: number
  date_to?: number
  category_key?: CategoryKey
  sort?: 'occurred_at_desc' | 'amount_desc'
}

export type ExpenseListResponse = {
  items: ExpenseDTO[]
  nextCursor: string | null
}

export type BudgetScope = 'household' | 'personal'

export type BudgetDTO = {
  id: string
  scope: BudgetScope
  householdId: string | null
  ownerUserId: string | null
  period: string
  totalLimitMinor: number
  currencyCode: string
  categoryLimits: Array<{
    categoryKey: CategoryKey
    limitMinor: number
  }>
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

export type ListBudgetsParams = {
  householdId?: string
  scope?: BudgetScope
  period?: string
}

export type ListBudgetsResponse = {
  items: BudgetDTO[]
}

type AnalyticsMonthParams = {
  period: string
  household_id?: string
}

type AnalyticsRangeParams = {
  date_from: number
  date_to: number
  household_id?: string
}

export type AnalyticsOverviewParams =
  | AnalyticsMonthParams
  | AnalyticsRangeParams

export type AnalyticsComparisonParams = AnalyticsOverviewParams

export type AnalyticsOverviewDTO = {
  period: string
  householdId: string | null
  currencyCode: string
  totalSpendMinor: number
  expenseCount: number
  dailySpend: Array<{
    date: string
    totalSpendMinor: number
  }>
  topCategories: Array<{
    categoryKey: CategoryKey
    totalSpendMinor: number
    percentOfTotal: number
    expenseCount: number
  }>
}

export type AnalyticsComparisonDTO = {
  householdId: string | null
  currencyCode: string
  currentPeriod: {
    period: string
    totalSpendMinor: number
    expenseCount: number
  }
  previousPeriod: {
    period: string
    totalSpendMinor: number
    expenseCount: number
  }
  totalDeltaSpendMinor: number
  totalDeltaPercent: number | null
  topCategoryDeltas: Array<{
    categoryKey: CategoryKey
    currentTotalSpendMinor: number
    previousTotalSpendMinor: number
    deltaSpendMinor: number
    deltaPercent: number | null
  }>
}
