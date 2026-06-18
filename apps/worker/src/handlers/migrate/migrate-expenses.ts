import type { Context } from 'hono'

import type {
  MigrateExpensesRequest,
  MigrateExpensesResultDTO,
} from '@/contracts'
import { categoryKindMap } from '@/contracts/expense-schemas'
import { migrateExpensesRequestSchema } from '@/contracts/migrate-schemas'
import type { REFERENCE_CATEGORY_KEYS } from '@/contracts/reference-data'
import {
  createExpense,
  type CreateExpenseInput,
} from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { getCurrencyFractionDigits } from '@/handlers/expenses/shared'
import { forbidden, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
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

  // Determine source key (default 'bank-transfer')
  const sourceKey: string = body.sourceKey ?? 'bank-transfer'

  // Determine currency + household scope
  let currencyCode = 'VND'
  let householdId: string | null = null
  if (body.householdId) {
    householdId = body.householdId

    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
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
    blankNote: 0,
    invalidDate: 0,
    unknownCategory: 0,
    error: 0,
  }
  const errors: Array<{ date: string; txId: string; reason: string }> = []
  const decimals = getCurrencyFractionDigits(currencyCode)
  const factor = 10 ** decimals

  // Iterate over all transactions
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

      // Validate note as title
      const title = tx.note.trim()
      if (title.length === 0) {
        skipped++
        skippedBreakdown.blankNote++
        continue
      }

      const finalTitle = title.length > 200 ? title.slice(0, 200) : title

      // Convert to minor units
      const amount = Math.abs(tx.money)
      const amountMinor = Math.round(amount * factor)

      // Dry run — count but don't persist
      if (body.dryRun === true) {
        created++
        continue
      }

      // Persist
      const input: CreateExpenseInput = {
        id: newId(),
        householdId,
        spentByUserId: currentUser.id,
        categoryKey,
        sourceKey,
        categoryId: null,
        amountMinor,
        currencyCode,
        occurredAt,
        title: finalTitle,
        note: tx.note || null,
      }

      try {
        await createExpense(db, input)
        created++
      } catch (error: unknown) {
        skipped++
        skippedBreakdown.error++

        errors.push({
          date: tx.date,
          txId,
          reason: error instanceof Error ? error.message : 'create failed',
        })
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
