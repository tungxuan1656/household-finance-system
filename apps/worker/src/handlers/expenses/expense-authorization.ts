import type { StoredExpense } from '@/db/repositories/expense-repository'
import {
  findExpenseByIdIncludingDeleted,
  findExpenseByIdRaw,
} from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, notFound } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import {
  canEditAnyExpense,
  canEditOwnExpense,
} from '@/lib/permissions/household-policy'

/**
 * Fetches an expense by ID and verifies the caller has basic read access.
 *
 * For personal expenses, only the spender/owner is allowed.
 * For household-attached expenses, the caller must be a member.
 *
 * Throws AppError (notFound / forbidden) if the expense cannot be returned.
 */
export const authorizeExpenseAccess = async (
  db: D1Database,
  expenseId: string,
  currentUserId: string,
  locale: SupportedLocale,
  options: { includeDeleted?: boolean } = {},
): Promise<StoredExpense> => {
  const expense = options.includeDeleted
    ? await findExpenseByIdIncludingDeleted(db, expenseId)
    : await findExpenseByIdRaw(db, expenseId)

  if (!expense) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  if (!expense.householdId) {
    if (expense.createdByUserId !== currentUserId) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }
  }

  return expense
}

/**
 * Verifies the caller can edit or delete a household expense.
 *
 * For personal expenses this is a no-op (already enforced by
 * authorizeExpenseAccess). For household expenses, the caller must
 * be an active member with either:
 *   - own-expense edit permission (if they are the creator), or
 *   - any-expense edit permission (admin / manager role).
 *
 * Throws AppError (forbidden) if the user lacks permission.
 */
export const authorizeExpenseMutation = async (
  db: D1Database,
  expense: StoredExpense,
  currentUserId: string,
  locale: SupportedLocale,
): Promise<void> => {
  if (!expense.householdId) {
    // Personal expenses are already gated by authorizeExpenseAccess.
    return
  }

  const membership = await findActiveHouseholdMembership(
    db,
    currentUserId,

    expense.householdId!,
  )

  if (!membership) {
    throw forbidden(locale, 'expenses.expenseForbidden')
  }

  const canEdit =
    (expense.createdByUserId === currentUserId &&
      canEditOwnExpense(membership.role)) ||
    canEditAnyExpense(membership.role)

  if (!canEdit) {
    throw forbidden(locale, 'expenses.expenseForbidden')
  }
}

/**
 * Verifies the caller is an admin for the household that owns the expense.
 *
 * This is used for admin-only operations such as restoring a deleted
 * household expense.
 *
 * Throws AppError (forbidden) if the expense has no household or the
 * caller is not an admin.
 */
export const authorizeAdminForHouseholdExpense = async (
  db: D1Database,
  expense: StoredExpense,
  currentUserId: string,
  locale: SupportedLocale,
): Promise<void> => {
  if (!expense.householdId) {
    throw forbidden(locale, 'expenses.expenseForbidden')
  }

  const membership = await findActiveHouseholdMembership(
    db,
    currentUserId,
    expense.householdId,
  )

  if (!membership || !canEditAnyExpense(membership.role)) {
    throw forbidden(locale, 'expenses.expenseForbidden')
  }
}
