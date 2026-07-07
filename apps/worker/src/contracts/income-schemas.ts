import { z } from 'zod'

import { REFERENCE_SOURCE_KEYS } from './reference-data'

const messages = {
  amountMustBePositive: 'Amount must be a positive number',
  sourceKeyInvalid: 'Invalid source key',
  titleMustNotBeBlank: 'Title must not be blank',
  titleTooLong: 'Title must be at most 200 characters',
  occurredAtMustBePositive: 'Occurred at must be a positive integer timestamp',
  noteTooLong: 'Note must be at most 1000 characters',
}

export const createIncomeRequestSchema = () =>
  z
    .object({
      amount: z.number().positive(messages.amountMustBePositive),
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
    })
    .strict()

export const incomeListQuerySchema = () =>
  z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      date_from: z.coerce.number().int().optional(),
      date_to: z.coerce.number().int().optional(),
      source_key: z.enum(REFERENCE_SOURCE_KEYS).optional(),
    })
    .strict()

export const incomePathParamsSchema = () =>
  z
    .object({
      id: z.string().trim().min(1, 'Income ID must not be blank'),
    })
    .strict()
