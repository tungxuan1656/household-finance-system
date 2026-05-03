import { Hono } from 'hono'

import {
  type ArchiveExpenseGroupResponse,
  type CreateExpenseGroupRequest,
  createExpenseGroupRequestSchema,
  type CreateExpenseGroupResponse,
  type ExpenseGroupDTO,
  expenseGroupPathParamsSchema,
  type ListExpenseGroupsResponse,
  type UpdateExpenseGroupRequest,
  updateExpenseGroupRequestSchema,
  type UpdateExpenseGroupResponse,
} from '@/contracts'
import {
  findExpenseGroupById,
  findExpenseGroupByIdIncludingArchived,
} from '@/db/repositories/expense-group-repository'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { archiveExpenseGroup } from '@/handlers/expense-groups/archive-expense-group'
import { createExpenseGroup } from '@/handlers/expense-groups/create-expense-group'
import { getExpenseGroup } from '@/handlers/expense-groups/get-expense-group'
import { listExpenseGroups } from '@/handlers/expense-groups/list-expense-groups'
import { updateExpenseGroup } from '@/handlers/expense-groups/update-expense-group'
import { forbidden, invalidInput, notFound } from '@/lib/errors'
import { formatValidationDetails } from '@/lib/i18n'
import { canManageGroups } from '@/lib/permissions/household-policy'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const groupsRoutes = new Hono<AppBindings>()

// All group routes require authentication
groupsRoutes.use('/groups', authMiddleware)
groupsRoutes.use('/groups/*', authMiddleware)

// POST /api/v1/groups
groupsRoutes.post('/groups', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')

  // Parse raw body to extract householdId alongside the group payload
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

  const membership = await findActiveHouseholdMembership(
    ctx.env.DB,
    currentUser.id,
    householdId,
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  if (!canManageGroups(membership.role)) {
    throw forbidden(locale, 'errors.forbidden')
  }

  const result = await createExpenseGroup(
    ctx.env,
    currentUser.id,
    householdId,
    locale,
    parsed.data as CreateExpenseGroupRequest,
  )

  return success<CreateExpenseGroupResponse>(ctx, result, 201)
})

// GET /api/v1/groups?household_id=...
groupsRoutes.get('/groups', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')
  const householdId = ctx.req.query('household_id')

  if (!householdId?.trim()) {
    throw invalidInput(locale, 'errors.invalidRequestBody', {
      formErrors: [],
      fieldErrors: { household_id: ['Required'] },
    })
  }

  const membership = await findActiveHouseholdMembership(
    ctx.env.DB,
    currentUser.id,
    householdId.trim(),
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const result = await listExpenseGroups(ctx.env, householdId.trim())

  return success<ListExpenseGroupsResponse>(ctx, result)
})

// GET /api/v1/groups/:id
groupsRoutes.get('/groups/:id', async (ctx) => {
  const locale = ctx.get('locale')
  const currentUser = ctx.get('currentUser')
  const groupId = ctx.req.param('id')

  const params = expenseGroupPathParamsSchema().safeParse({ id: groupId })
  if (!params.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(params.error.issues, locale),
    )
  }

  const group = await findExpenseGroupById(ctx.env.DB, params.data.id)
  if (!group) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const membership = await findActiveHouseholdMembership(
    ctx.env.DB,
    currentUser.id,
    group.householdId,
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const result = await getExpenseGroup(ctx.env, params.data.id, locale)

  return success<ExpenseGroupDTO>(ctx, result)
})

// PATCH /api/v1/groups/:id
groupsRoutes.patch('/groups/:id', async (ctx) => {
  const locale = ctx.get('locale')
  const currentUser = ctx.get('currentUser')
  const groupId = ctx.req.param('id')

  const params = expenseGroupPathParamsSchema().safeParse({ id: groupId })
  if (!params.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(params.error.issues, locale),
    )
  }

  const group = await findExpenseGroupById(ctx.env.DB, params.data.id)
  if (!group) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const membership = await findActiveHouseholdMembership(
    ctx.env.DB,
    currentUser.id,
    group.householdId,
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const body = await readJsonBody<UpdateExpenseGroupRequest>(
    ctx.req.raw,
    updateExpenseGroupRequestSchema(),
    locale,
  )

  const result = await updateExpenseGroup(
    ctx.env,
    params.data.id,
    membership.role,
    locale,
    body,
  )

  return success<UpdateExpenseGroupResponse>(ctx, result)
})

// POST /api/v1/groups/:id/archive
groupsRoutes.post('/groups/:id/archive', async (ctx) => {
  const locale = ctx.get('locale')
  const currentUser = ctx.get('currentUser')
  const groupId = ctx.req.param('id')

  const params = expenseGroupPathParamsSchema().safeParse({ id: groupId })
  if (!params.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(params.error.issues, locale),
    )
  }

  const group = await findExpenseGroupByIdIncludingArchived(
    ctx.env.DB,
    params.data.id,
  )
  if (!group) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const membership = await findActiveHouseholdMembership(
    ctx.env.DB,
    currentUser.id,
    group.householdId,
  )
  if (!membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  const result = await archiveExpenseGroup(
    ctx.env,
    params.data.id,
    membership.role,
    locale,
  )

  return success<ArchiveExpenseGroupResponse>(ctx, result)
})
