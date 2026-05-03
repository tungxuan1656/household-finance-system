import type { Context } from 'hono'

import type { ArchiveExpenseGroupResponse } from '@/contracts'
import { expenseGroupPathParamsSchema } from '@/contracts'
import {
  archiveExpenseGroup as archiveExpenseGroupRepo,
  findExpenseGroupByIdIncludingArchived,
} from '@/db/repositories/expense-group-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput, notFound } from '@/lib/errors'
import { defaultLocale, formatValidationDetails } from '@/lib/i18n'
import { canManageGroups } from '@/lib/permissions/household-policy'
import type { AppBindings } from '@/types'

type ArchiveExpenseGroupHandlerCtx = Context<AppBindings>

export const archiveExpenseGroupHandler = async (
  ctx: ArchiveExpenseGroupHandlerCtx,
): Promise<ArchiveExpenseGroupResponse> => {
  const locale = ctx.get('locale') ?? defaultLocale
  const currentUser = ctx.get('currentUser')
  const db = ctx.env.DB

  const groupId = ctx.req.param('id')

  const params = expenseGroupPathParamsSchema().safeParse({ id: groupId })
  if (!params.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(params.error.issues, locale),
    )
  }

  const group = await findExpenseGroupByIdIncludingArchived(db, params.data.id)
  if (!group) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const membership = await findActiveHouseholdMembership(
    db,
    currentUser.id,
    group.householdId,
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  if (!canManageGroups(membership.role)) {
    throw forbidden(locale, 'errors.forbidden')
  }

  const archived = await archiveExpenseGroupRepo(db, params.data.id)
  if (!archived) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return { archived: true }
}
