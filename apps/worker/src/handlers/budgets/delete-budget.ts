import type { Context } from 'hono'

import type { DeleteBudgetResponse } from '@/contracts'
import { budgetPathParamsSchema } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  findBudgetById,
  restoreBudget,
  softDeleteBudget,
} from '@/db/repositories/budget-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, internalError, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import { canManageBudgets } from '@/lib/permissions/household-policy'
import type { AppBindings } from '@/types'

type DeleteBudgetHandlerCtx = Context<AppBindings>

export const deleteBudgetHandler = async (
  ctx: DeleteBudgetHandlerCtx,
): Promise<DeleteBudgetResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const budgetId = ctx.req.param('id')

  const params = budgetPathParamsSchema().safeParse({ id: budgetId })
  if (!params.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(params.error.issues, locale),
    )
  }

  const budget = await findBudgetById(db, params.data.id)
  if (!budget) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  if (budget.scope === 'personal') {
    if (budget.ownerUserId !== currentUser.id) {
      throw notFound(locale, 'errors.resourceNotFound')
    }
  } else {
    if (!budget.householdId) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      budget.householdId,
    )
    if (!membership) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    if (!canManageBudgets(membership.role)) {
      throw forbidden(locale, 'errors.forbidden')
    }
  }

  const deleted = await softDeleteBudget(db, budget.id)
  if (!deleted) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  try {
    await createAuditLogEntry(db, {
      householdId: budget.householdId,
      actorUserId: currentUser.id,
      actionType: 'budget.deleted',
      targetType: 'budget',
      targetId: budget.id,
      payloadJson: JSON.stringify({
        scope: budget.scope,
        period: budget.budgetMonth,
        totalLimitMinor: budget.totalLimitMinor,
      }),
    })
  } catch (error) {
    const rollback = await restoreBudget(db, budget.id)

    if (!rollback) {
      throw internalError(locale, 'errors.rollbackFailed')
    }

    throw error
  }

  return { deleted: true }
}
