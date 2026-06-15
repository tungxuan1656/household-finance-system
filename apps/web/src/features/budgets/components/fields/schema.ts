import { z } from 'zod'

export const budgetFormSchema = z.object({
  period: z
    .string()
    .regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, 'Period must be in YYYY-MM format'),
  totalLimit: z
    .number()
    .positive('Total budget must be a positive number')
    .max(999999999999, 'Total budget must be at most 999,999,999,999'),
  currencyCode: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
})

export const createBudgetFormSchema = (
  mode: 'create' | 'edit',
  householdId: string | null,
) => {
  return budgetFormSchema.refine(
    (data) => {
      if (mode === 'create' && householdId === null) {
        return !!data.currencyCode && /^[A-Z]{3}$/.test(data.currencyCode)
      }

      return true
    },
    {
      message: 'Currency code is required for personal budgets',
      path: ['currencyCode'],
    },
  )
}

export const budgetSchema = budgetFormSchema
export type BudgetFormValues = z.infer<typeof budgetFormSchema>
