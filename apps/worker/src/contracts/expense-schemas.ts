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
        .refine((val) => val.length > 0, {
          message: messages.titleMustNotBeBlank,
        })
        .refine((val) => val.length <= 200, {
          message: messages.titleTooLong,
        }),
      occurredAt: z.number().int().positive(messages.occurredAtMustBePositive),
      note: z.string().max(1000, messages.noteTooLong).optional(),
      visibility: expenseVisibilitySchema.default('private'),
      householdId: z.string().trim().min(1).optional(),
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

export const updateExpenseRequestSchema = () =>
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
        .refine((val) => val.length > 0, {
          message: messages.titleMustNotBeBlank,
        })
        .refine((val) => val.length <= 200, {
          message: messages.titleTooLong,
        }),
      occurredAt: z.number().int().positive(messages.occurredAtMustBePositive),
      note: z.string().max(1000, messages.noteTooLong).optional(),
      visibility: expenseVisibilitySchema,
      householdId: z.string().trim().min(1).optional(),
      payerUserId: z.string().trim().min(1).optional(),
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

export const expensePathParamsSchema = () =>
  z
    .object({
      id: z.string().trim().min(1, 'Expense ID must not be blank'),
    })
    .strict()

export const expenseListQuerySchema = () =>
  z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      household_id: z.string().trim().min(1).optional(),
      date_from: z.coerce.number().int().optional(),
      date_to: z.coerce.number().int().optional(),
      category_key: z.enum(REFERENCE_CATEGORY_KEYS).optional(),
      payer_id: z.string().trim().min(1).optional(),
      visibility: expenseVisibilitySchema.optional(),
    })
    .strict()

export const deletedExpenseListQuerySchema = () =>
  z
    .object({
      household_id: z.string().trim().min(1),
    })
    .strict()
