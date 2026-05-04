import { z } from 'zod'

const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export const analyticsOverviewQuerySchema = () =>
  z
    .object({
      period: z.string().regex(PERIOD_PATTERN, 'Period must match YYYY-MM'),
      household_id: z.string().trim().min(1).optional(),
    })
    .strict()
