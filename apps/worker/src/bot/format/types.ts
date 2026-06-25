export interface ParsedPreviewData {
  amountMinor: number
  occurredAt: string // YYYY-MM-DD
  categoryKey: string
  title: string
  sourceKey: string
  scope: 'personal' | 'household'
  householdId?: string
  householdName?: string
  groupName?: string
}

export type BudgetStatusLabel = 'ok' | 'warning' | 'exceeded'

export interface StatsOptions {
  totalSpendMinor: number
  expenseCount: number
  currencyCode: string
  scopeLabel: string
  periodLabel: string
}

export interface TopCategoriesOptions {
  categories: Array<{
    categoryKey: string
    totalSpendMinor: number
    percentOfTotal: number
  }>
  scopeLabel: string
  periodLabel: string
  currencyCode: string
}

export interface ExpensePreviewOptions extends ParsedPreviewData {
  currencyCode: string
}

export interface BudgetLineOptions {
  name: string
  totalPlannedMinor: number
  totalActualMinor: number
  currencyCode: string
  status: BudgetStatusLabel
}

export interface BudgetAlertOptions {
  name: string
  totalPlannedMinor: number
  totalActualMinor: number
  currencyCode: string
  isExceeded: boolean
}

export interface HouseholdActivityOptions {
  actorName: string
  householdName: string
  title: string
  amountMinor: number
  categoryKey: string
  occurredAt: string
  currencyCode: string
}

export interface WeeklyDigestOptions {
  totalSpendMinor: number
  expenseCount: number
  topCategories: Array<{
    categoryKey: string
    totalSpendMinor: number
    percentOfTotal: number
  }>
  budgetWarnings: Array<{
    name: string
    status: 'exceeded' | 'warning'
    percent: number
  }>
  currencyCode: string
  periodLabel: string
  deepLinkUrl?: string
}
