import type { Context } from 'hono'

import type { BudgetDTO } from '@/contracts'
import { createBudgetBodySchema } from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import { createBudget as createBudgetRepo } from '@/db/repositories/budget-repository'
import { findBudgetLimits } from '@/db/repositories/budget-repository'
import {
  findHouseholdBudgetByPeriod,
  findPersonalBudgetByPeriod,
} from '@/db/repositories/budget-repository'
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

  const rawHouseholdId =
    typeof raw?.householdId === 'string' ? raw.householdId.trim() : ''

  const { householdId: _ignored, ...rest } = raw
  const parsed = createBudgetBodySchema(locale).safeParse(rest)
  if (!parsed.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(parsed.error.issues, locale),
    )
  }

  const { scope, period, totalLimit, currencyCode, categoryLimits } =
    parsed.data

  if (scope === 'household') {
    const householdId = rawHouseholdId
    if (!householdId) {
      throw invalidInput(locale, 'errors.invalidRequestBody', {
        formErrors: [],
        fieldErrors: { householdId: ['Required'] },
      })
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

    const existing = await findHouseholdBudgetByPeriod(db, householdId, period)
    if (existing) {
      throw conflict(locale, 'errors.conflict')
    }

    const household = await findHouseholdById(db, householdId)
    if (!household) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    const created = await createBudgetRepo(db, {
      scope: 'household',
      householdId,
      period,
      totalLimitMinor: totalLimit,
      currencyCode: household.defaultCurrencyCode,
      createdByUserId: currentUser.id,
      categoryLimits: categoryLimits?.map((cl) => ({
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
        scope,
        period: created.budgetMonth,
        totalLimitMinor: created.totalLimitMinor,
        categoryLimitCount: limits.length,
      }),
    })

    return {
      id: created.id,
      scope: 'household',
      householdId: created.householdId,
      ownerUserId: created.ownerUserId,
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

  // scope === 'personal'
  if (rawHouseholdId) {
    throw invalidInput(locale, 'errors.invalidRequestBody', {
      formErrors: [],
      fieldErrors: { householdId: ['Must be empty for personal budgets'] },
    })
  }

  const ownerUserId = currentUser.id
  const existing = await findPersonalBudgetByPeriod(db, ownerUserId, period)
  if (existing) {
    throw conflict(locale, 'errors.conflict')
  }

  const created = await createBudgetRepo(db, {
    scope: 'personal',
    ownerUserId,
    period,
    totalLimitMinor: totalLimit,
    currencyCode: currencyCode!,
    createdByUserId: currentUser.id,
    categoryLimits: categoryLimits?.map((cl) => ({
      categoryKey: cl.categoryKey,
      limitMinor: cl.limitMinor,
    })),
  })

  const limits = await findBudgetLimits(db, created.id)

  await createAuditLogEntry(db, {
    householdId: null,
    actorUserId: currentUser.id,
    actionType: 'budget.created',
    targetType: 'budget',
    targetId: created.id,
    payloadJson: JSON.stringify({
      scope,
      period: created.budgetMonth,
      totalLimitMinor: created.totalLimitMinor,
      categoryLimitCount: limits.length,
    }),
  })

  return {
    id: created.id,
    scope: 'personal',
    householdId: null,
    ownerUserId: created.ownerUserId,
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
