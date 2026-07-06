import type {
  MigrateExpensesRequest,
  MigrateExpensesResultDTO,
} from '@/contracts'
import { categoryKindMap } from '@/contracts/expense-schemas'
import type { REFERENCE_CATEGORY_KEYS } from '@/contracts/reference-data'
import {
  type CreateExpenseInput,
  createExpensesBatch,
} from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { getCurrencyFractionDigits } from '@/handlers/expenses/shared'
import { forbidden, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import { canCreateExpense } from '@/lib/permissions/household-policy'
import { newId } from '@/utils/id'

export const DEFAULT_CATEGORY_MAPPING: Record<
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

const YEAR_MONTH_DAY_RE = /^\d{8}$/

const isValidDate = (s: string): boolean => {
  if (!YEAR_MONTH_DAY_RE.test(s)) return false

  const year = Number.parseInt(s.slice(0, 4), 10)
  const month = Number.parseInt(s.slice(4, 6), 10)
  const day = Number.parseInt(s.slice(6, 8), 10)
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  const d = new Date(year, month - 1, day)

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  )
}

export const runMigration = async (
  db: D1Database,
  locale: SupportedLocale,
  body: MigrateExpensesRequest,
  spentByUserId: string,
): Promise<MigrateExpensesResultDTO> => {
  const sourceKey = body.sourceKey ?? 'bank-transfer'

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

    if (!canCreateExpense(membership.role)) {
      throw forbidden(locale, 'errors.forbidden')
    }

    const foundHousehold = await findHouseholdById(db, householdId)
    if (!foundHousehold) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    currencyCode = foundHousehold.defaultCurrencyCode
  }

  const effectiveMapping: Record<
    string,
    (typeof REFERENCE_CATEGORY_KEYS)[number]
  > = {
    ...DEFAULT_CATEGORY_MAPPING,
    ...body.categoryMapping,
  }

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

  type ValidEntry = {
    input: CreateExpenseInput
    date: string
    txId: string
  }

  const validEntries: ValidEntry[] = []

  for (const txMap of Object.values(body.transactions)) {
    for (const [txId, tx] of Object.entries(txMap)) {
      if (tx.money > 0) {
        skipped++
        skippedBreakdown.income++
        continue
      }

      if (tx.money === 0) {
        skipped++
        skippedBreakdown.zero++
        continue
      }

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

      if (categoryKindMap[categoryKey] !== 'expense') {
        skipped++
        skippedBreakdown.nonExpenseCategory++

        errors.push({
          date: tx.date,
          txId,
          reason: 'mapped category is not expense-kind',
        })

        continue
      }

      const trimmedNote = tx.note.trim()
      const finalTitle =
        trimmedNote.length > 200 ? trimmedNote.slice(0, 200) : trimmedNote

      const amountMinor = Math.round(Math.abs(tx.money) * factor)

      validEntries.push({
        input: {
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
        },
        date: tx.date,
        txId,
      })
    }
  }

  if (body.dryRun === true) {
    created = validEntries.length
  } else if (validEntries.length > 0) {
    const chunkSize = 1000
    for (let i = 0; i < validEntries.length; i += chunkSize) {
      const chunk = validEntries.slice(i, i + chunkSize)
      const results = await createExpensesBatch(
        db,
        chunk.map((entry) => entry.input),
      )

      for (let j = 0; j < chunk.length; j++) {
        const result = results[j]
        const entry = chunk[j]!

        if (result?.success) {
          created++
          continue
        }

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

  return {
    created,
    skipped,
    skippedBreakdown,
    errors,
    dryRun: body.dryRun === true,
  }
}
