import type { z } from 'zod'

import type {
  internalMigrateExpensesRequestSchema,
  migrateExpensesRequestSchema,
} from './migrate-schemas'

export type MigrateExpensesRequest = z.output<
  ReturnType<typeof migrateExpensesRequestSchema>
>

export type InternalMigrateExpensesRequest = z.output<
  ReturnType<typeof internalMigrateExpensesRequestSchema>
>

export interface MigrateExpensesErrorEntry {
  date: string
  txId: string
  reason: string
}

export interface MigrateExpensesResultDTO {
  created: number
  skipped: number
  skippedBreakdown: Record<string, number>
  errors: MigrateExpensesErrorEntry[]
  dryRun: boolean
}
