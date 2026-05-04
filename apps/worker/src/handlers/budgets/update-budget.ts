import type { Context } from 'hono'

import type { BudgetDTO } from '@/contracts'
import { budgetPathParamsSchema, updateBudgetRequestSchema } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  findBudgetById,
  findBudgetLimits,
  updateBudget,
} from '@/db/repositories/budget-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import { canManageBudgets } from '@/lib/permissions/household-policy'
import type { AppBindings } from '@/types'

type UpdateBudgetHandlerCtx = Context<AppBindings>

export const updateBudgetHandler = async (
  ctx: UpdateBudgetHandlerCtx,
): Promise<BudgetDTO> => {
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

  let raw: Record<string, unknown>
  try {
    raw = await ctx.req.json<Record<string, unknown>>()
  } catch {
    throw invalidInput(locale, 'errors.invalidJsonBody')
  }

  const parsed = updateBudgetRequestSchema().safeParse(raw)
  if (!parsed.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(parsed.error.issues, locale),
    )
  }

  const budget = await findBudgetById(db, params.data.id)
  if (!budget) {
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

  await updateBudget(db, budget.id, {
    totalLimitMinor: parsed.data.totalLimit,
    categoryLimits: parsed.data.categoryLimits?.map((cl) => ({
      categoryKey: cl.categoryKey,
      limitMinor: cl.limitMinor,
    })),
  })

  const updated = await findBudgetById(db, budget.id)
  if (!updated) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const limits = await findBudgetLimits(db, updated.id)

  await createAuditLogEntry(db, {
    householdId: budget.householdId,
    actorUserId: currentUser.id,
    actionType: 'budget.updated',
    targetType: 'budget',
    targetId: budget.id,
    payloadJson: JSON.stringify({
      totalLimitMinor: parsed.data.totalLimit,
      categoryLimitCount: parsed.data.categoryLimits?.length,
    }),
  })

  return {
    id: updated.id,
    householdId: updated.householdId,
    period: updated.budgetMonth,
    totalLimitMinor: updated.totalLimitMinor,
    currencyCode: updated.currencyCode,
    categoryLimits: limits.map((l) => ({
      categoryKey: l.categoryKey!,
      limitMinor: l.limitMinor,
    })),
    createdByUserId: updated.createdByUserId,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  }
}
