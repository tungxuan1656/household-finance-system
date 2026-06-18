import { z } from 'zod'

import {
  REFERENCE_CATEGORY_KEYS,
  REFERENCE_SOURCE_KEYS,
} from './reference-data'

const messages = {
  transactionsRequired: 'Transactions object is required',
  invalidCategoryKey: 'Invalid category key in categoryMapping',
  invalidSourceKey: 'Invalid source key',
  categoryMappingInvalid:
    'Category mapping must be a record of string to valid category keys',
}

export const migrateExpensesRequestSchema = () =>
  z
    .object({
      transactions: z.record(
        z.string(),
        z.record(
          z.string(),
          z
            .object({
              categoryId: z.number().int(),
              date: z.string().min(1),
              money: z.number(),
              note: z.string(),
            })
            .strict(),
        ),
      ),
      householdId: z.string().trim().min(1).optional(),
      sourceKey: z
        .enum(REFERENCE_SOURCE_KEYS, {
          message: messages.invalidSourceKey,
        })
        .optional(),
      categoryMapping: z
        .record(
          z.string(),
          z.enum(REFERENCE_CATEGORY_KEYS, {
            message: messages.invalidCategoryKey,
          }),
        )
        .optional(),
      dryRun: z.boolean().optional(),
    })
    .strict()
