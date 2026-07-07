import type { z } from 'zod'

import type {
  createIncomeRequestSchema,
  incomeListQuerySchema,
  incomePathParamsSchema,
} from './income-schemas'
import type { REFERENCE_SOURCE_KEYS } from './reference-data'

export type CreateIncomeRequest = z.output<
  ReturnType<typeof createIncomeRequestSchema>
>

export interface IncomeDTO {
  id: string
  spentByUserId: string
  amountMinor: number
  currencyCode: string
  categoryKey: 'money-in'
  sourceKey: (typeof REFERENCE_SOURCE_KEYS)[number]
  occurredAt: number
  title: string
  note: string | null
  createdAt: number
  updatedAt: number
}

export type CreateIncomeResponse = IncomeDTO

export type IncomeListQuery = z.output<ReturnType<typeof incomeListQuerySchema>>

export interface IncomeListResponse {
  items: IncomeDTO[]
  nextCursor: string | null
}

export interface DeleteIncomeResponse {
  deleted: true
}

export type IncomePathParams = z.output<
  ReturnType<typeof incomePathParamsSchema>
>
