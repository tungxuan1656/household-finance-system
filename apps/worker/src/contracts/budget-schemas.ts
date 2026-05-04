import { z } from 'zod'

const messages = {
  householdIdRequired: 'Household ID is required',
  periodInvalid: 'Period must be in YYYY-MM format',
  totalLimitMustBePositive: 'Total budget limit must be a positive number',
  totalLimitTooLarge: 'Total budget limit must be at most 999999999999',
  categoryKeyInvalid: 'Category key must be a valid expense category',
  limitMinorMustBePositive: 'Category limit must be a positive number',
  limitMinorTooLarge: 'Category limit must be at most 999999999999',
  duplicateCategoryKeys: 'Category keys must be unique',
  atLeastOneFieldRequired: 'At least one field must be provided for update',
}

const periodRegex = /^\d{4}-(?:0[1-9]|1[0-2])$/

const EXPENSE_CATEGORY_KEYS = [
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
  'charity',
  'other',
] as const

export const createBudgetBodySchema = () =>
  z
    .object({
      period: z.string().regex(periodRegex, messages.periodInvalid),
      totalLimit: z
        .number()
        .int()
        .positive(messages.totalLimitMustBePositive)
        .max(999999999999, messages.totalLimitTooLarge),
      categoryLimits: z
        .array(
          z.object({
            categoryKey: z.enum(EXPENSE_CATEGORY_KEYS, {
              message: messages.categoryKeyInvalid,
            }),
            limitMinor: z
              .number()
              .int()
              .positive(messages.limitMinorMustBePositive)
              .max(999999999999, messages.limitMinorTooLarge),
          }),
        )
        .optional()
        .default([]),
    })
    .strict()
    .refine(
      (data) => {
        if (!data.categoryLimits || data.categoryLimits.length === 0)
          return true

        const keys = data.categoryLimits.map((cl) => cl.categoryKey)

        return new Set(keys).size === keys.length
      },
      { message: messages.duplicateCategoryKeys },
    )

/** @deprecated Use createBudgetBodySchema for body validation. householdId is validated separately in the handler. */
export const createBudgetRequestSchema = createBudgetBodySchema

export const updateBudgetRequestSchema = () =>
  z
    .object({
      totalLimit: z
        .number()
        .int()
        .positive(messages.totalLimitMustBePositive)
        .max(999999999999, messages.totalLimitTooLarge)
        .optional(),
      categoryLimits: z
        .array(
          z.object({
            categoryKey: z.enum(EXPENSE_CATEGORY_KEYS, {
              message: messages.categoryKeyInvalid,
            }),
            limitMinor: z
              .number()
              .int()
              .positive(messages.limitMinorMustBePositive)
              .max(999999999999, messages.limitMinorTooLarge),
          }),
        )
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: messages.atLeastOneFieldRequired,
    })
    .refine(
      (data) => {
        if (!data.categoryLimits || data.categoryLimits.length === 0)
          return true

        const keys = data.categoryLimits.map((cl) => cl.categoryKey)

        return new Set(keys).size === keys.length
      },
      { message: messages.duplicateCategoryKeys },
    )

export const budgetPathParamsSchema = () =>
  z
    .object({
      id: z.string().trim().min(1, 'Budget ID must not be blank'),
    })
    .strict()

export const budgetListQuerySchema = () =>
  z
    .object({
      household_id: z.string().trim().min(1, 'Household ID is required'),
      period: z.string().regex(periodRegex, messages.periodInvalid).optional(),
    })
    .strict()
