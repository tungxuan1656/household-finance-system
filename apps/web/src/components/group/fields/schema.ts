import { z } from 'zod'

export const groupFormSchema = z
  .object({
    name: z
      .string()
      .transform((val) => val.trim())
      .refine((val) => val.length > 0, {
        message: 'Group name must not be blank',
      })
      .refine((val) => val.length <= 200, {
        message: 'Group name must be at most 200 characters',
      }),
    description: z.string().max(1000).optional(),
    startDate: z.number().optional(),
    endDate: z.number().optional(),
    eventBudget: z.number().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate !== undefined && data.endDate !== undefined) {
        return data.endDate >= data.startDate
      }

      return true
    },
    {
      message: 'End date must not be before start date',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => {
      if (data.eventBudget !== undefined) {
        return data.eventBudget <= 999999999999
      }

      return true
    },
    {
      message: 'Event budget must be at most 999999999999',
      path: ['eventBudget'],
    },
  )

export type GroupFormValues = z.infer<typeof groupFormSchema>
