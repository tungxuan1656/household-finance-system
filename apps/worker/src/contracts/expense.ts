import { z } from 'zod'

import {
  REFERENCE_CATEGORY_KEYS,
  REFERENCE_SOURCE_KEYS,
} from './reference-data'

export const expenseVisibilitySchema = z.enum(['private', 'household'])

const messages = {
  amountMustBePositive: 'Amount must be a positive number',
  categoryKeyInvalid: 'Invalid category key',
  sourceKeyInvalid: 'Invalid source key',
  titleMustNotBeBlank: 'Title must not be blank',
  titleTooLong: 'Title must be at most 200 characters',
  occurredAtMustBePositive: 'Occurred at must be a positive integer timestamp',
  noteTooLong: 'Note must be at most 1000 characters',
  householdIdRequiredWhenHouseholdVisibility:
    'householdId is required when visibility is household',
  categoryMustBeExpenseKind:
    'Category must be an expense kind (not money-in or lending)',
}

// maps category key -> kind, mirroring the static catalog
const categoryKindMap: {
  [K in (typeof REFERENCE_CATEGORY_KEYS)[number]]: string
} = {
  food: 'expense',
  transport: 'expense',
  dating: 'expense',
  'living-costs': 'expense',
  family: 'expense',
  children: 'expense',
  relatives: 'expense',
  shopping: 'expense',
  beauty: 'expense',
  health: 'expense',
  social: 'expense',
  repairs: 'expense',
  work: 'expense',
  education: 'expense',
  investment: 'expense',
  'self-development': 'expense',
  sports: 'expense',
  travel: 'expense',
  hobbies: 'expense',
  pets: 'expense',
  'money-in': 'income',
  lending: 'transfer',
  charity: 'expense',
  other: 'expense',
}

export const createExpenseRequestSchema = () =>
  z
    .object({
      amount: z.number().positive(messages.amountMustBePositive),
      categoryKey: z.enum(REFERENCE_CATEGORY_KEYS, {
        message: messages.categoryKeyInvalid,
      }),
      sourceKey: z.enum(REFERENCE_SOURCE_KEYS, {
        message: messages.sourceKeyInvalid,
      }),
      title: z
        .string()
        .transform((val) => val.trim())
        .refine(
          (val) => {
            if (val.length === 0) return false

            return val.length <= 200
          },
          { message: messages.titleTooLong },
        ),
      occurredAt: z.number().int().positive(messages.occurredAtMustBePositive),
      note: z.string().max(1000, messages.noteTooLong).optional(),
      visibility: expenseVisibilitySchema.default('private'),
      householdId: z.string().optional(),
      payerUserId: z.string().optional(),
    })
    .strict()
    .refine((data) => data.visibility !== 'household' || !!data.householdId, {
      message: messages.householdIdRequiredWhenHouseholdVisibility,
      path: ['householdId'],
    })
    .refine(
      (data) => {
        const kind = categoryKindMap[data.categoryKey]

        return kind === 'expense'
      },
      {
        message: messages.categoryMustBeExpenseKind,
        path: ['categoryKey'],
      },
    )

export type CreateExpenseRequest = z.output<
  ReturnType<typeof createExpenseRequestSchema>
>

export interface ExpenseDTO {
  id: string
  title: string
  amountMinor: number
  categoryKey: (typeof REFERENCE_CATEGORY_KEYS)[number]
  sourceKey: (typeof REFERENCE_SOURCE_KEYS)[number]
  occurredAt: number
  visibility: 'private' | 'household'
  householdId: string | null
  payerUserId: string | null
  note: string | null
  createdByUserId: string
  createdAt: number
  updatedAt: number
}

export interface CreateExpenseResponse {
  expense: ExpenseDTO
}

export type ExpensePathParams = z.output<typeof expensePathParamsSchema>

export const expensePathParamsSchema = () =>
  z
    .object({
      id: z.string().trim().min(1, 'Expense ID must not be blank'),
    })
    .strict()
