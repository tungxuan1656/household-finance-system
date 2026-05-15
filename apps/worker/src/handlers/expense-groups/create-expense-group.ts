import type { Context } from 'hono'

import type { ExpenseGroupDTO } from '@/contracts'
import { createExpenseGroupRequestSchema } from '@/contracts'
import { createExpenseGroup as createExpenseGroupRepo } from '@/db/repositories/expense-group-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import { canManageGroups } from '@/lib/permissions/household-policy'
import type { AppBindings } from '@/types'

type CreateExpenseGroupHandlerCtx = Context<AppBindings>

export const createExpenseGroupHandler = async (
  ctx: CreateExpenseGroupHandlerCtx,
): Promise<ExpenseGroupDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  // Parse raw body to extract householdId alongside the group payload
  let raw: Record<string, unknown>
  try {
    raw = await ctx.req.json<Record<string, unknown>>()
  } catch {
    throw invalidInput(locale, 'errors.invalidJsonBody')
  }

  const householdId =
    typeof raw?.householdId === 'string' && raw.householdId.trim()
      ? raw.householdId.trim()
      : null

  // Validate the remaining fields with the existing schema
  const { householdId: _ignored, ...rest } = raw
  const parsed = createExpenseGroupRequestSchema().safeParse(rest)
  if (!parsed.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(parsed.error.issues, locale),
    )
  }

  // Validate membership and permissions
  if (householdId) {
    const membership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      householdId,
    )
    if (!membership) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    if (!canManageGroups(membership.role)) {
      throw forbidden(locale, 'errors.forbidden')
    }
  }

  // Create group via repository
  const created = await createExpenseGroupRepo(db, {
    householdId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    startDate: parsed.data.startDate ?? null,
    endDate: parsed.data.endDate ?? null,
    eventBudgetMinor: parsed.data.eventBudget ?? null,
    createdByUserId: currentUser.id,
  })

  return {
    id: created.id,
    name: created.name,
    description: created.description,
    status: created.status,
    startDate: created.startDate,
    endDate: created.endDate,
    eventBudgetMinor: created.eventBudgetMinor,
    totalSpendMinor: created.totalSpendMinor,
    householdId: created.householdId,
    createdByUserId: created.createdByUserId,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  }
}
