export interface StoredExpense {
  id: string
  householdId: string | null
  createdByUserId: string
  payerUserId: string
  categoryKey: string
  sourceKey: string
  categoryId: string | null
  amountMinor: number
  currencyCode: string
  occurredAt: number
  visibility: 'private' | 'household'
  title: string
  note: string | null
  deletedAt: number | null
  createdAt: number
  updatedAt: number
}

export type ExpenseRow = {
  id: string
  household_id: string | null
  created_by_user_id: string
  payer_user_id: string
  category_key: string
  source_key: string
  category_id: string | null
  amount_minor: number
  currency_code: string
  occurred_at: number
  visibility: 'private' | 'household'
  title: string
  note: string | null
  deleted_at: number | null
  created_at: number
  updated_at: number
}

export const mapRow = (r: ExpenseRow): StoredExpense => ({
  id: r.id,
  householdId: r.household_id,
  createdByUserId: r.created_by_user_id,
  payerUserId: r.payer_user_id,
  categoryKey: r.category_key,
  sourceKey: r.source_key,
  categoryId: r.category_id,
  amountMinor: r.amount_minor,
  currencyCode: r.currency_code,
  occurredAt: r.occurred_at,
  visibility: r.visibility,
  title: r.title,
  note: r.note,
  deletedAt: r.deleted_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})
