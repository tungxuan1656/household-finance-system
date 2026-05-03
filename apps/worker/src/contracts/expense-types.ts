import type { z } from 'zod'

import type {
  createExpenseRequestSchema,
  deletedExpenseListQuerySchema,
  expenseListQuerySchema,
  expensePathParamsSchema,
  updateExpenseRequestSchema,
} from './expense-schemas'
import {
  type REFERENCE_CATEGORY_KEYS,
  type REFERENCE_SOURCE_KEYS,
} from './reference-data'

export type CreateExpenseRequest = z.output<
  ReturnType<typeof createExpenseRequestSchema>
>

export type UpdateExpenseRequest = z.output<
  ReturnType<typeof updateExpenseRequestSchema>
>

export interface ExpenseDTO {
  id: string
  title: string
  amountMinor: number
  currencyCode: string
  categoryKey: (typeof REFERENCE_CATEGORY_KEYS)[number]
  sourceKey: (typeof REFERENCE_SOURCE_KEYS)[number]
  occurredAt: number
  visibility: 'private' | 'household'
  householdId: string | null
  payerUserId: string
  note: string | null
  groupIds: string[]
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

export type CreateExpenseResponse = ExpenseDTO

export type UpdateExpenseResponse = ExpenseDTO

export interface DeleteExpenseResponse {
  deleted: true
}

export type RestoreExpenseResponse = ExpenseDTO

export type ExpensePathParams = z.output<
  ReturnType<typeof expensePathParamsSchema>
>

export type ExpenseListQuery = z.output<
  ReturnType<typeof expenseListQuerySchema>
>

export type DeletedExpenseListQuery = z.output<
  ReturnType<typeof deletedExpenseListQuerySchema>
>

export interface ExpenseListResponse {
  items: ExpenseDTO[]
  nextCursor: string | null
}
