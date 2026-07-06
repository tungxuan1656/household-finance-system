import type { Context } from 'hono'

import type {
  InternalMigrateExpensesRequest,
  MigrateExpensesRequest,
  MigrateExpensesResultDTO,
} from '@/contracts'
import { categoryKindMap } from '@/contracts/expense-schemas'
import {
  internalMigrateExpensesRequestSchema,
  migrateExpensesRequestSchema,
} from '@/contracts/migrate-schemas'
import type { REFERENCE_CATEGORY_KEYS } from '@/contracts/reference-data'
import {
  type CreateExpenseInput,
  createExpensesBatch,
} from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { findUserById } from '@/db/repositories/user-repository'
import { getCurrencyFractionDigits } from '@/handlers/expenses/shared'
import { forbidden, notFound } from '@/lib/errors'
import { defaultLocale, type SupportedLocale } from '@/lib/i18n'
import { canCreateExpense } from '@/lib/permissions/household-policy'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'
import { newId } from '@/utils/id'

const DEFAULT_CATEGORY_MAPPING: Record<
  string,
  (typeof REFERENCE_CATEGORY_KEYS)[number]
> = {
  '0': 'food',
  '1': 'transport',
  '2': 'living-costs',
  '3': 'dating',
  '4': 'family',
  '5': 'shopping',
  '6': 'health',
  '8': 'social',
  '9': 'money-in',
  '10': 'lending',
  '11': 'hobbies',
  '12': 'investment',
  '13': 'charity',
  '14': 'pets',
  '15': 'other',
  '16': 'children',
  '17': 'work',
  '18': 'travel',
  '19': 'education',
  '20': 'relatives',
  '22': 'sports',
  '23': 'beauty',
}

type MigrateHandlerCtx = Context<AppBindings>

export { DEFAULT_CATEGORY_MAPPING }

const YEAR_MONTH_DAY_RE = /^\d{8}$/

const isValidDate = (s: string): boolean => {
  if (!YEAR_MONTH_DAY_RE.test(s)) return false

  const year = Number.parseInt(s.slice(0, 4), 10)
  const month = Number.parseInt(s.slice(4, 6), 10)
  const day = Number.parseInt(s.slice(6, 8), 10)
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  // Basic day-in-month check
  const d = new Date(year, month - 1, day)

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  )
}

// ── Shared migration core ──────────────────────────────────────────────────

export const runMigration = async (
  db: D1Database,
  locale: SupportedLocale,
  body: MigrateExpensesRequest,
  spentByUserId: string,
): Promise<MigrateExpensesResultDTO> => {
  // Determine source key (default 'bank-transfer')
  const sourceKey: string = body.sourceKey ?? 'bank-transfer'

  // Determine currency + household scope
  let currencyCode = 'VND'
  let householdId: string | null = null
  if (body.householdId) {
    householdId = body.householdId

    const membership = await findActiveHouseholdMembership(
      db,
      spentByUserId,
      householdId,
    )
    if (!membership) {
      throw forbidden(locale, 'errors.forbidden')
    }

    const can = canCreateExpense(membership.role)
    if (!can) {
      throw forbidden(locale, 'errors.forbidden')
    }

    const foundHousehold = await findHouseholdById(db, householdId)
    if (!foundHousehold) {
      throw notFound(locale, 'errors.resourceNotFound')
    }
    currencyCode = foundHousehold.defaultCurrencyCode
  }

  // Build effective category mapping: default merged with overrides
  const effectiveMapping: Record<
    string,
    (typeof REFERENCE_CATEGORY_KEYS)[number]
  > = {
    ...DEFAULT_CATEGORY_MAPPING,
    ...body.categoryMapping,
  }

  // Statistics
  let created = 0
  let skipped = 0
  const skippedBreakdown: Record<string, number> = {
    income: 0,
    zero: 0,
    nonExpenseCategory: 0,
    invalidDate: 0,
    unknownCategory: 0,
    error: 0,
  }
  const errors: Array<{ date: string; txId: string; reason: string }> = []
  const decimals = getCurrencyFractionDigits(currencyCode)
  const factor = 10 ** decimals

  // ── First pass: validate entries in pure JS, skip invalid ones ──
  type ValidEntry = {
    input: CreateExpenseInput
    date: string
    txId: string
  }

  const validEntries: ValidEntry[] = []

  for (const [_dateKey, txMap] of Object.entries(body.transactions)) {
    for (const [txId, tx] of Object.entries(txMap)) {
      // Skip income (money > 0)
      if (tx.money > 0) {
        skipped++
        skippedBreakdown.income++
        continue
      }

      // Skip zero (money === 0)
      if (tx.money === 0) {
        skipped++
        skippedBreakdown.zero++
        continue
      }

      // Validate date format YYYYMMDD
      if (!isValidDate(tx.date)) {
        skipped++
        skippedBreakdown.invalidDate++
        errors.push({ date: tx.date, txId, reason: 'invalid date' })
        continue
      }

      const year = Number.parseInt(tx.date.slice(0, 4), 10)
      const month = Number.parseInt(tx.date.slice(4, 6), 10)
      const day = Number.parseInt(tx.date.slice(6, 8), 10)
      const occurredAt = Date.UTC(year, month - 1, day)

      // Look up category mapping
      const categoryKey = effectiveMapping[String(tx.categoryId)]
      if (!categoryKey) {
        skipped++
        skippedBreakdown.unknownCategory++

        errors.push({
          date: tx.date,
          txId,
          reason: 'unknown external categoryId',
        })

        continue
      }

      // Validate category is expense-kind
      const kind = categoryKindMap[categoryKey]
      if (kind !== 'expense') {
        skipped++
        skippedBreakdown.nonExpenseCategory++

        errors.push({
          date: tx.date,
          txId,
          reason: 'mapped category is not expense-kind',
        })

        continue
      }

      // Use trimmed note as title. Empty/blank is allowed (DB requires
      // non-null, so we coerce to '' when blank).
      const trimmedNote = tx.note.trim()
      const finalTitle =
        trimmedNote.length > 200 ? trimmedNote.slice(0, 200) : trimmedNote

      // Convert to minor units
      const amount = Math.abs(tx.money)
      const amountMinor = Math.round(amount * factor)

      // Build the input (no DB call yet)
      const input: CreateExpenseInput = {
        id: newId(),
        householdId,
        spentByUserId,
        categoryKey,
        sourceKey,
        categoryId: null,
        amountMinor,
        currencyCode,
        occurredAt,
        title: finalTitle,
        note: tx.note || null,
      }
      validEntries.push({ input, date: tx.date, txId })
    }
  }

  // ── Second pass: dry-run counts or batch-persist ──
  if (body.dryRun === true) {
    created = validEntries.length
  } else if (validEntries.length > 0) {
    const CHUNK_SIZE = 1000
    for (let i = 0; i < validEntries.length; i += CHUNK_SIZE) {
      const chunk = validEntries.slice(i, i + CHUNK_SIZE)
      const results = await createExpensesBatch(
        db,
        chunk.map((e) => e.input),
      )

      // D1Result array is aligned with the input order of this chunk.
      for (let j = 0; j < chunk.length; j++) {
        const result = results[j]
        const entry = chunk[j]!
        if (result && result.success) {
          created++
        } else {
          skipped++
          skippedBreakdown.error++

          const reason =
            result && 'error' in result && result.error
              ? String(result.error)
              : 'create failed'
          errors.push({ date: entry.date, txId: entry.txId, reason })
        }
      }
    }
  }

  return {
    created,
    skipped,
    skippedBreakdown,
    errors,
    dryRun: body.dryRun === true,
  }
}

// ── Public handler (bearer-token self-service) ─────────────────────────────

export const migrateExpensesHandler = async (
  ctx: MigrateHandlerCtx,
): Promise<MigrateExpensesResultDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const body = await readJsonBody<MigrateExpensesRequest>(
    ctx.req.raw,
    migrateExpensesRequestSchema(),
    locale,
  )

  return runMigration(db, locale, body, currentUser.id)
}

// ── Internal handler (admin/internal, targets another user) ────────────────

export const internalMigrateExpensesHandler = async (
  ctx: MigrateHandlerCtx,
): Promise<MigrateExpensesResultDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const db = ctx.env.DB

  const body = await readJsonBody<InternalMigrateExpensesRequest>(
    ctx.req.raw,
    internalMigrateExpensesRequestSchema(),
    locale,
  )

  // Validate target user exists
  const targetUser = await findUserById(db, body.targetUserId)

  if (!targetUser) {
    throw notFound(locale, 'errors.userNotFound')
  }

  // Build a clean MigrateExpensesRequest from the internal body
  const migrateBody: MigrateExpensesRequest = {
    transactions: body.transactions,
    householdId: body.householdId,
    sourceKey: body.sourceKey,
    categoryMapping: body.categoryMapping,
    dryRun: body.dryRun,
  }

  return runMigration(db, locale, migrateBody, body.targetUserId)
}
