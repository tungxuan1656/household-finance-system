import { z } from 'zod'

import { t } from '@/lib/i18n/t'
import type { CategoryKey, SourceKey } from '@/types/reference-data'
import { CATEGORY_KEYS, SOURCE_KEYS } from '@/types/reference-data'

// Category keys that are valid for expense creation (exclude income/transfer kinds)
const EXPENSE_ONLY_CATEGORY_KEYS: readonly CategoryKey[] = CATEGORY_KEYS.filter(
  (key) => key !== 'money-in' && key !== 'lending',
) as readonly CategoryKey[]

const categoryError = t('expense.error.categoryRequired')
const sourceError = t('expense.error.sourceRequired')

export const expenseFormSchema = z
  .object({
    amount: z.number().positive(t('expense.error.amountPositive')).finite(),
    categoryKey: z.enum(
      [...EXPENSE_ONLY_CATEGORY_KEYS] as [CategoryKey, ...CategoryKey[]],
      {
        error: (issue) =>
          issue.input === undefined ? categoryError : 'Invalid category',
      },
    ),
    sourceKey: z.enum([...SOURCE_KEYS] as [SourceKey, ...SourceKey[]], {
      error: (issue) =>
        issue.input === undefined ? sourceError : 'Invalid source',
    }),
    title: z
      .string()
      .trim()
      .min(1, t('expense.error.titleRequired'))
      .max(200, t('expense.error.titleTooLong')),
    occurredAt: z.number().int().positive(t('expense.error.dateRequired')),
    note: z
      .string()
      .trim()
      .max(1000, t('expense.error.noteTooLong'))
      .optional(),
    payerUserId: z.string().optional(),
    visibility: z.enum(['private', 'household']).default('private'),
    householdId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.visibility === 'household' && !data.householdId) {
        return false
      }

      return true
    },
    {
      message: t('expense.error.householdRequired'),
      path: ['householdId'],
    },
  )

export type ExpenseFormInputValues = z.input<typeof expenseFormSchema>
export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
