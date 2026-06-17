import { z } from 'zod'

const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
const timestampSchema = z.coerce.number().int().nonnegative()

const analyticsHouseholdScopeSchema = {
  household_id: z.string().trim().min(1).optional(),
}

const analyticsMonthQuerySchema = z
  .object({
    period: z.string().regex(PERIOD_PATTERN, 'Period must match YYYY-MM'),
    ...analyticsHouseholdScopeSchema,
  })
  .strict()

const analyticsDateRangeQuerySchema = z
  .object({
    date_from: timestampSchema,
    date_to: timestampSchema,
    ...analyticsHouseholdScopeSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.date_to <= value.date_from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'date_to must be greater than date_from',
        path: ['date_to'],
      })
    }
  })

export const analyticsOverviewQuerySchema = () =>
  z.union([analyticsMonthQuerySchema, analyticsDateRangeQuerySchema])

export const analyticsComparisonQuerySchema = analyticsOverviewQuerySchema

export const analyticsGroupsQuerySchema = () => analyticsMonthQuerySchema
