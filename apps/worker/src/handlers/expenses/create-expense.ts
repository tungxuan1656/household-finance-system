import type { Context } from 'hono'

import type { CreateExpenseRequest, ExpenseDTO } from '@/contracts'
import { createExpenseRequestSchema } from '@/contracts'
import { createExpense } from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { forbidden, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import { canCreateExpense } from '@/lib/permissions/household-policy'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'
import { newId } from '@/utils/id'

type CreateExpenseHandlerCtx = Context<AppBindings>

// Note: helper to build repository input removed to keep logic local

export const createExpenseHandler = async (
  ctx: CreateExpenseHandlerCtx,
): Promise<ExpenseDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  // Read and validate request body
  const body = await readJsonBody<CreateExpenseRequest>(
    ctx.req.raw,
    createExpenseRequestSchema(locale),
    locale,
  )

  // Default currency and household handling
  let currencyCode = 'VND'
  let householdId: string | null = null
  if (body.visibility === 'household') {
    if (!body.householdId) {
      throw invalidInput(locale, 'validation.invalidValue', {
        path: ['householdId'],
      })
    }
    householdId = body.householdId

    // Validate membership and permissions
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
  } else {
    currencyCode = 'VND'
  }

  // Resolve payer and createdBy
  const createdByUserId = currentUser.id
  const payerUserId = body.payerUserId ?? createdByUserId

  // Prepare input for repo
  // Build input to repository. Use a loose type to accommodate NULL householdId
  const input: any = {
    id: newId(),
    householdId,
    createdByUserId,
    payerUserId,
    categoryKey: body.categoryKey,
    sourceKey: body.sourceKey,
    categoryId: null,
    amountMinor: 0,
    currencyCode,
    occurredAt: body.occurredAt,
    visibility: body.visibility,
    title: body.title,
    note: body.note ?? null,
  }

  // Convert amount to minor based on currency
  const amountMinor =
    currencyCode === 'VND'
      ? Math.round(body.amount)
      : Math.round(body.amount * 100)
  input.amountMinor = amountMinor

  // Create expense via repository
  const created = await createExpense(db, input)

  // Map to DTO
  const dto: ExpenseDTO = {
    id: created.id,
    title: created.title,
    amount: created.amountMinor,
    categoryKey: created.categoryKey as any,
    sourceKey: created.sourceKey as any,
    occurredAt: created.occurredAt,
    visibility: created.visibility,
    householdId: created.householdId,
    payerUserId: created.payerUserId,
    note: created.note,
    createdByUserId: created.createdByUserId,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  }

  // Return as API envelope via helper in route
  return dto
}
