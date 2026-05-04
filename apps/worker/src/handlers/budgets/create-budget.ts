import type { Context } from 'hono'

import type { BudgetDTO } from '@/contracts'
import { createBudgetBodySchema } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import { createBudget as createBudgetRepo } from '@/db/repositories/budget-repository'
import { findBudgetByPeriod } from '@/db/repositories/budget-repository'
import { findBudgetLimits } from '@/db/repositories/budget-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { conflict, forbidden, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import { canManageBudgets } from '@/lib/permissions/household-policy'
import type { AppBindings } from '@/types'

type CreateBudgetHandlerCtx = Context<AppBindings>

export const createBudgetHandler = async (
  ctx: CreateBudgetHandlerCtx,
): Promise<BudgetDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  let raw: Record<string, unknown>
  try {
    raw = await ctx.req.json<Record<string, unknown>>()
  } catch {
    throw invalidInput(locale, 'errors.invalidJsonBody')
  }

  if (typeof raw?.householdId !== 'string' || !raw.householdId.trim()) {
    throw invalidInput(locale, 'errors.invalidRequestBody', {
      formErrors: [],
      fieldErrors: { householdId: ['Required'] },
    })
  }

  const householdId = raw.householdId.trim()

  const { householdId: _ignored, ...rest } = raw
  const parsed = createBudgetBodySchema().safeParse(rest)
  if (!parsed.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(parsed.error.issues, locale),
    )
  }

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    householdId,
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  if (!canManageBudgets(membership.role)) {
    throw forbidden(locale, 'errors.forbidden')
  }

  const existing = await findBudgetByPeriod(db, householdId, parsed.data.period)
  if (existing) {
    throw conflict(locale, 'errors.conflict')
  }

  const household = await findHouseholdById(db, householdId)
  if (!household) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const created = await createBudgetRepo(db, {
    householdId,
    period: parsed.data.period,
    totalLimitMinor: parsed.data.totalLimit,
    currencyCode: household.defaultCurrencyCode,
    createdByUserId: currentUser.id,
    categoryLimits: parsed.data.categoryLimits?.map((cl) => ({
      categoryKey: cl.categoryKey,
      limitMinor: cl.limitMinor,
    })),
  })

  const limits = await findBudgetLimits(db, created.id)

  await createAuditLogEntry(db, {
    householdId,
    actorUserId: currentUser.id,
    actionType: 'budget.created',
    targetType: 'budget',
    targetId: created.id,
    payloadJson: JSON.stringify({
      period: created.budgetMonth,
      totalLimitMinor: created.totalLimitMinor,
      categoryLimitCount: limits.length,
    }),
  })

  return {
    id: created.id,
    householdId: created.householdId,
    period: created.budgetMonth,
    totalLimitMinor: created.totalLimitMinor,
    currencyCode: created.currencyCode,
    categoryLimits: limits.map((l) => ({
      categoryKey: l.categoryKey!,
      limitMinor: l.limitMinor,
    })),
    createdByUserId: created.createdByUserId,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  }
}
