import { z } from 'zod'

const messages = {
  nameMustNotBeBlank: 'Group name must not be blank',
  nameTooLong: 'Group name must be at most 200 characters',
  descriptionTooLong: 'Description must be at most 1000 characters',
  endDateBeforeStartDate: 'End date must not be before start date',
  eventBudgetMustBePositive:
    'Event budget must be a positive number when provided',
  eventBudgetTooLarge: 'Event budget must be at most 999999999999',
}

export const createExpenseGroupRequestSchema = () =>
  z
    .object({
      name: z
        .string()
        .transform((val) => val.trim())
        .refine((val) => val.length > 0, {
          message: messages.nameMustNotBeBlank,
        })
        .refine((val) => val.length <= 200, {
          message: messages.nameTooLong,
        }),
      description: z.string().max(1000, messages.descriptionTooLong).optional(),
      startDate: z.number().int().optional(),
      endDate: z.number().int().optional(),
      eventBudget: z
        .number()
        .positive(messages.eventBudgetMustBePositive)
        .optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (data.startDate !== undefined && data.endDate !== undefined) {
          return data.endDate >= data.startDate
        }

        return true
      },
      {
        message: messages.endDateBeforeStartDate,
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
        message: messages.eventBudgetTooLarge,
        path: ['eventBudget'],
      },
    )

export const updateExpenseGroupRequestSchema = () =>
  z
    .object({
      name: z
        .string()
        .transform((val) => val.trim())
        .refine((val) => val.length > 0, {
          message: messages.nameMustNotBeBlank,
        })
        .refine((val) => val.length <= 200, {
          message: messages.nameTooLong,
        })
        .optional(),
      description: z.string().max(1000, messages.descriptionTooLong).optional(),
      startDate: z.number().int().optional(),
      endDate: z.number().int().optional(),
      eventBudget: z
        .number()
        .positive(messages.eventBudgetMustBePositive)
        .optional(),
    })
    .strict()
    .refine(
      (data) => {
        return Object.keys(data).length > 0
      },
      {
        message: 'At least one field must be provided for update',
      },
    )
    .refine(
      (data) => {
        if (data.startDate !== undefined && data.endDate !== undefined) {
          return data.endDate >= data.startDate
        }

        return true
      },
      {
        message: messages.endDateBeforeStartDate,
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
        message: messages.eventBudgetTooLarge,
        path: ['eventBudget'],
      },
    )

export const expenseGroupPathParamsSchema = () =>
  z
    .object({
      id: z.string().trim().min(1, 'Expense group ID must not be blank'),
    })
    .strict()

export const replaceExpenseGroupsRequestSchema = () =>
  z
    .object({
      groupIds: z
        .array(z.string().trim().min(1, 'Group ID must not be blank'))
        .min(0, 'Group IDs must be an array'),
    })
    .strict()
