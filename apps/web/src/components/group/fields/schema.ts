import { z } from 'zod'

export const groupFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  eventBudget: z.number().positive().optional(),
})

export type GroupFormValues = z.infer<typeof groupFormSchema>
