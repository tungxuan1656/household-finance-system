import { z } from 'zod'

export const budgetFormSchema = z.object({
  period: z
    .string()
    .regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, 'Period must be in YYYY-MM format'),
  totalLimit: z
    .number()
    .positive('Total budget must be a positive number')
    .max(999999999999, 'Total budget must be at most 999,999,999,999'),
})

export const budgetSchema = budgetFormSchema
export type BudgetFormValues = z.infer<typeof budgetFormSchema>
