export interface StoredBudget {
  id: string
  householdId: string
  scope: 'household'
  budgetMonth: string
  startDate: string | null
  endDate: string | null
  currencyCode: string
  totalLimitMinor: number
  categoryId: string | null
  createdByUserId: string
  archivedAt: number | null
  createdAt: number
  updatedAt: number
}

export interface StoredBudgetLimit {
  id: string
  budgetId: string
  householdId: string
  categoryId: string | null
  categoryKey: string | null
  limitMinor: number
  createdAt: number
  updatedAt: number
}

export type BudgetRow = {
  id: string
  household_id: string
  scope: 'household'
  budget_month: string
  start_date: string | null
  end_date: string | null
  currency_code: string
  total_limit_minor: number
  category_id: string | null
  created_by_user_id: string
  archived_at: number | null
  created_at: number
  updated_at: number
}

export type BudgetLimitRow = {
  id: string
  budget_id: string
  household_id: string
  category_id: string | null
  category_key: string | null
  limit_minor: number
  created_at: number
  updated_at: number
}

export const mapBudgetRow = (r: BudgetRow): StoredBudget => ({
  id: r.id,
  householdId: r.household_id,
  scope: r.scope,
  budgetMonth: r.budget_month,
  startDate: r.start_date,
  endDate: r.end_date,
  currencyCode: r.currency_code,
  totalLimitMinor: r.total_limit_minor,
  categoryId: r.category_id,
  createdByUserId: r.created_by_user_id,
  archivedAt: r.archived_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

export const mapBudgetLimitRow = (r: BudgetLimitRow): StoredBudgetLimit => ({
  id: r.id,
  budgetId: r.budget_id,
  householdId: r.household_id,
  categoryId: r.category_id,
  categoryKey: r.category_key,
  limitMinor: r.limit_minor,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

export const BUDGET_COLUMNS = `
  b.id,
  b.household_id,
  b.scope,
  b.budget_month,
  b.start_date,
  b.end_date,
  b.currency_code,
  b.total_limit_minor,
  b.category_id,
  b.created_by_user_id,
  b.archived_at,
  b.created_at,
  b.updated_at
`

export const BUDGET_LIMIT_COLUMNS = `
  bl.id,
  bl.budget_id,
  bl.household_id,
  bl.category_id,
  bl.category_key,
  bl.limit_minor,
  bl.created_at,
  bl.updated_at
`
