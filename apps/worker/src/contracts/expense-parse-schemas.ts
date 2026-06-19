import { z } from 'zod'

import { categoryKindMap } from './expense-schemas'
import {
  REFERENCE_CATEGORY_KEYS,
  REFERENCE_SOURCE_KEYS,
} from './reference-data'

// ── Parse request ────────────────────────────────────────────────────────────
// The client sends text and the client-local "today" date in YYYY-MM-DD format.

export const MAX_PARSE_TEXT_LENGTH = 4000

export const parseExpensesRequestSchema = () =>
  z
    .object({
      text: z
        .string()
        .min(1, 'Text must not be empty')
        .max(
          MAX_PARSE_TEXT_LENGTH,
          `Text must be at most ${MAX_PARSE_TEXT_LENGTH} characters`,
        ),
      defaultOccurredAt: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
    })
    .strict()

// ── Normalised parsed item ───────────────────────────────────────────────────
// After applying defaults and validating against the reference catalogue.
// This is the single validation gate for AI output — any item that fails
// safeParse here is dropped.  The schema enforces expense-kind categories,
// valid source keys, title length, and YYYY-MM-DD occurredAt.

export const parsedExpenseItemSchema = z
  .object({
    amount: z.number().positive(),
    categoryKey: z.enum(REFERENCE_CATEGORY_KEYS),
    sourceKey: z.enum(REFERENCE_SOURCE_KEYS),
    title: z.string().min(1).max(200, 'Title must be at most 200 characters'),
    occurredAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  })
  .strict()
  .refine(
    (data) => {
      const kind = categoryKindMap[data.categoryKey]

      return kind === 'expense'
    },
    {
      message: 'Category must be an expense kind (not money-in or lending)',
      path: ['categoryKey'],
    },
  )

// ── Parse response ───────────────────────────────────────────────────────────

export const parseExpensesResponseSchema = z
  .object({
    expenses: z.array(parsedExpenseItemSchema),
    droppedCount: z.number().int().nonnegative().optional(),
    message: z.string().optional(),
  })
  .strict()

// ── Inferred types ───────────────────────────────────────────────────────────

export type ParseExpensesRequest = z.output<
  ReturnType<typeof parseExpensesRequestSchema>
>

export type ParsedExpenseItem = z.output<typeof parsedExpenseItemSchema>

export type ParseExpensesResponse = z.output<typeof parseExpensesResponseSchema>
