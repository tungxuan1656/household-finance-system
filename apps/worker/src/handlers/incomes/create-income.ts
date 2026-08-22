import type { Context } from 'hono'

import type { CreateIncomeRequest, IncomeDTO } from '@/contracts'
import { createIncomeRequestSchema } from '@/contracts'
import {
  createIncome,
  type CreateIncomeInput,
} from '@/db/repositories/income-repository'
import { getMinorUnits } from '@/lib/currency'
import { invalidInput } from '@/lib/errors'
import { defaultLocale } from '@/lib/i18n'
import { readJsonBody } from '@/lib/validation'
import type { AppBindings } from '@/types'
import { newId } from '@/utils/id'

type CreateIncomeHandlerCtx = Context<AppBindings>

export const createIncomeHandler = async (
  ctx: CreateIncomeHandlerCtx,
): Promise<IncomeDTO> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  // Read and validate request body
  const body = await readJsonBody<CreateIncomeRequest>(
    ctx.req.raw,
    createIncomeRequestSchema(),
    locale,
  )

  // Incomes are always in VND (personal, no household)
  const currencyCode = 'VND'

  // Convert amount to minor units and validate it doesn't round to zero
  const amountMinor = getMinorUnits(body.amount, currencyCode)
  if (amountMinor <= 0) {
    throw invalidInput(locale, 'validation.invalidValue', {
      path: ['amount'],
    })
  }

  // Prepare input for repo
  const input: CreateIncomeInput = {
    id: newId(),
    spentByUserId: currentUser.id,
    sourceKey: body.sourceKey,
    amountMinor,
    currencyCode,
    occurredAt: body.occurredAt,
    title: body.title,
    note: body.note ?? null,
  }

  // Create income via repository
  const created = await createIncome(db, input)

  // Map to DTO
  const dto: IncomeDTO = {
    id: created.id,
    spentByUserId: created.spentByUserId,
    amountMinor: created.amountMinor,
    currencyCode: created.currencyCode,
    categoryKey: 'money-in',
    sourceKey: created.sourceKey as IncomeDTO['sourceKey'],
    occurredAt: created.occurredAt,
    title: created.title,
    note: created.note,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  }

  return dto
}
