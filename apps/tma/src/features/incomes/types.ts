import type { CategoryKey, SourceKey } from '@/features/home/types'

export interface IncomeDTO {
  id: string
  spentByUserId: string
  amountMinor: number
  currencyCode: string
  categoryKey: CategoryKey
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note: string | null
  createdAt: number
  updatedAt: number
}

export interface CreateIncomeRequest {
  amount: number
  sourceKey: SourceKey
  title: string
  occurredAt: number
  note?: string
}

export type IncomeListParams = {
  cursor?: string
  limit?: number
  date_from?: number
  date_to?: number
  source_key?: SourceKey
}

export interface IncomeListResponse {
  items: IncomeDTO[]
  nextCursor: string | null
}
