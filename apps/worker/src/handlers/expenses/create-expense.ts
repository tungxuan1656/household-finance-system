import type { Context } from 'hono'

import type { CreateExpenseRequest, ExpenseDTO } from '@/contracts'
import { createExpenseRequestSchema } from '@/contracts'
import {
  findExpenseGroupById,
  replaceExpenseGroupAssignments,
} from '@/db/repositories/expense-group-repository'
import {
  createExpense,
  type CreateExpenseInput,
} from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { conflict, forbidden, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import { canCreateExpense } from '@/lib/permissions/household-policy'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'
import { newId } from '@/utils/id'

type CreateExpenseHandlerCtx = Context<AppBindings>

const getCurrencyFractionDigits = (currencyCode: string): number => {
  try {
    return (
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

const getMinorUnits = (amount: number, currencyCode: string): number => {
  const decimals = getCurrencyFractionDigits(currencyCode)
  const factor = 10 ** decimals

  return Math.round(amount * factor)
}

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
    createExpenseRequestSchema(),
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

  // Payer is always the creating user (no external attribution)
  const createdByUserId = currentUser.id
  const payerUserId = createdByUserId

  // Convert amount to minor units and validate it doesn't round to zero
  const amountMinor = getMinorUnits(body.amount, currencyCode)
  if (amountMinor <= 0) {
    throw invalidInput(locale, 'validation.invalidValue', {
      path: ['amount'],
    })
  }

  // Prepare input for repo
  const input: CreateExpenseInput = {
    id: newId(),
    householdId,
    createdByUserId,
    payerUserId,
    categoryKey: body.categoryKey,
    sourceKey: body.sourceKey,
    categoryId: null,
    amountMinor,
    currencyCode,
    occurredAt: body.occurredAt,
    visibility: body.visibility,
    title: body.title,
    note: body.note ?? null,
  }

  // Create expense via repository
  const created = await createExpense(db, input)

  // Wire group assignments if provided
  let groupIds: string[] = []
  if (body.groupIds && body.groupIds.length > 0 && created.householdId) {
    for (const groupId of body.groupIds) {
      const group = await findExpenseGroupById(db, groupId)
      if (!group) {
        throw notFound(locale, 'errors.resourceNotFound')
      }
      if (group.householdId !== created.householdId) {
        throw conflict(locale, 'errors.conflict')
      }
    }

    await replaceExpenseGroupAssignments(
      db,
      created.id,
      created.householdId,
      body.groupIds,
      currentUser.id,
    )

    groupIds = body.groupIds
  }

  // Map to DTO
  const dto: ExpenseDTO = {
    id: created.id,
    title: created.title,
    amountMinor: created.amountMinor,
    currencyCode: created.currencyCode,
    categoryKey: created.categoryKey as ExpenseDTO['categoryKey'],
    sourceKey: created.sourceKey as ExpenseDTO['sourceKey'],
    occurredAt: created.occurredAt,
    visibility: created.visibility,
    householdId: created.householdId,
    payerUserId: created.payerUserId,
    note: created.note,
    groupIds,
    createdByUserId: created.createdByUserId,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  }

  // Return as API envelope via helper in route
  return dto
}
