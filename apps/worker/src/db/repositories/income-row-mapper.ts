export interface StoredIncome {
  id: string
  spentByUserId: string
  amountMinor: number
  currencyCode: string
  occurredAt: number
  title: string
  note: string | null
  categoryKey: string
  sourceKey: string
  kind: 'income'
  deletedAt: number | null
  createdAt: number
  updatedAt: number
}

export type IncomeRow = {
  id: string
  spent_by_user_id: string
  amount_minor: number
  currency_code: string
  occurred_at: number
  title: string
  note: string | null
  category_key: string
  source_key: string
  kind: 'income'
  deleted_at: number | null
  created_at: number
  updated_at: number
}

export const mapIncomeRow = (r: IncomeRow): StoredIncome => ({
  id: r.id,
  spentByUserId: r.spent_by_user_id,
  amountMinor: r.amount_minor,
  currencyCode: r.currency_code,
  occurredAt: r.occurred_at,
  title: r.title,
  note: r.note,
  categoryKey: r.category_key,
  sourceKey: r.source_key,
  kind: r.kind,
  deletedAt: r.deleted_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})
