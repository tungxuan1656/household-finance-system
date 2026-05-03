import type { Context } from 'hono'

import type { ExpenseDTO, UpdateExpenseRequest } from '@/contracts'
import {
  expensePathParamsSchema,
  updateExpenseRequestSchema,
} from '@/contracts'
import { createAuditLogEntry } from '@/db/repositories/audit-log-repository'
import {
  updateExpense,
  type UpdateExpenseInput,
} from '@/db/repositories/expense-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { forbidden, internalError, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'

import {
  authorizeExpenseAccess,
  authorizeExpenseMutation,
} from './expense-authorization'
import {
  buildExpenseChangeSet,
  getMinorUnits,
  mapStoredExpenseToDto,
} from './shared'

type UpdateExpenseHandlerCtx = Context<AppBindings>

export const updateExpenseHandler = async (
  ctx: UpdateExpenseHandlerCtx,
): Promise<ExpenseDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const parsedParams = expensePathParamsSchema().safeParse({
    id: ctx.req.param('id'),
  })
  if (!parsedParams.success) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const body = await readJsonBody<UpdateExpenseRequest>(
    ctx.req.raw,
    updateExpenseRequestSchema(),
    locale,
  )

  const existingExpense = await authorizeExpenseAccess(
    db,
    parsedParams.data.id,
    currentUser.id,
    locale,
  )

  await authorizeExpenseMutation(db, existingExpense, currentUser.id, locale)

  let nextHouseholdId: string | null = null
  let currencyCode = 'VND'
  let payerUserId = body.payerUserId ?? existingExpense.payerUserId

  if (body.visibility === 'household') {
    if (!body.householdId) {
      throw invalidInput(locale, 'validation.invalidValue', {
        path: ['householdId'],
      })
    }

    nextHouseholdId = body.householdId

    const targetMembership = await findActiveHouseholdMembership(
      db,
      currentUser.id,
      nextHouseholdId,
    )

    if (!targetMembership) {
      throw forbidden(locale, 'expenses.expenseForbidden')
    }

    const household = await findHouseholdById(db, nextHouseholdId)
    if (!household) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    if (payerUserId !== currentUser.id) {
      const payerMembership = await findActiveHouseholdMembership(
        db,
        payerUserId,
        nextHouseholdId,
      )

      if (!payerMembership) {
        throw invalidInput(locale, 'validation.invalidValue', {
          path: ['payerUserId'],
        })
      }
    }

    currencyCode = household.defaultCurrencyCode
  } else {
    nextHouseholdId = null
    currencyCode = 'VND'
    if (body.payerUserId && body.payerUserId !== currentUser.id) {
      throw invalidInput(locale, 'validation.invalidValue', {
        path: ['payerUserId'],
      })
    }
    payerUserId = currentUser.id
  }

  const amountMinor = getMinorUnits(body.amount, currencyCode)
  if (amountMinor <= 0) {
    throw invalidInput(locale, 'validation.invalidValue', {
      path: ['amount'],
    })
  }

  const updateInput: UpdateExpenseInput = {
    expenseId: existingExpense.id,
    householdId: nextHouseholdId,
    payerUserId,
    categoryKey: body.categoryKey,
    sourceKey: body.sourceKey,
    amountMinor,
    currencyCode,
    occurredAt: body.occurredAt,
    visibility: body.visibility,
    title: body.title,
    note: body.note ?? null,
  }

  const updatedExpense = await updateExpense(db, updateInput)
  if (!updatedExpense) {
    throw notFound(locale, 'expenses.expenseNotFound')
  }

  const auditHouseholdId =
    updatedExpense.householdId ?? existingExpense.householdId

  const changes = buildExpenseChangeSet(existingExpense, updatedExpense)

  try {
    await createAuditLogEntry(db, {
      householdId: auditHouseholdId,
      actorUserId: currentUser.id,
      actionType: 'expense.updated',
      targetType: 'expense',
      targetId: updatedExpense.id,
      payloadJson: JSON.stringify({
        changes,
        visibilityBefore: existingExpense.visibility,
        visibilityAfter: updatedExpense.visibility,
      }),
    })
  } catch (error) {
    const rollback = await updateExpense(db, {
      expenseId: existingExpense.id,
      householdId: existingExpense.householdId,
      payerUserId: existingExpense.payerUserId,
      categoryKey: existingExpense.categoryKey,
      sourceKey: existingExpense.sourceKey,
      amountMinor: existingExpense.amountMinor,
      currencyCode: existingExpense.currencyCode,
      occurredAt: existingExpense.occurredAt,
      visibility: existingExpense.visibility,
      title: existingExpense.title,
      note: existingExpense.note,
    })

    if (!rollback) {
      throw internalError(locale, 'errors.rollbackFailed')
    }

    throw error
  }

  return mapStoredExpenseToDto(updatedExpense)
}
