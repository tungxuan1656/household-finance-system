import { type Context, Hono } from 'hono'

import {
  type CreateHouseholdRequest,
  createHouseholdRequestSchema,
  type DeleteHouseholdResponse,
  type HouseholdDTO,
  type ListHouseholdsResponse,
  type UpdateHouseholdRequest,
  updateHouseholdRequestSchema,
} from '@/contracts'
import { archiveHousehold } from '@/handlers/households/archive-household'
import { createHousehold } from '@/handlers/households/create-household'
import { getHousehold } from '@/handlers/households/get-household'
import { listHouseholds } from '@/handlers/households/list-households'
import { updateHousehold } from '@/handlers/households/update-household'
import { notFound } from '@/lib/errors'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'
import {
  requireRole,
  resolveHouseholdMembership,
  validateHouseholdIdParam,
} from '@/middlewares/household-membership'
import type { AppBindings } from '@/types'

export const householdRoutes = new Hono<AppBindings>()

const getResolvedHouseholdContext = (ctx: Context<AppBindings>) => {
  const householdId = ctx.get('currentHouseholdId')
  const membership = ctx.get('currentHouseholdMembership')
  const locale = ctx.get('locale')

  if (!householdId || !membership) {
    throw notFound(locale, 'errors.resourceNotFound')
  }

  return { householdId, membership }
}

householdRoutes.use('/households/*', authMiddleware)
householdRoutes.use('/households', authMiddleware)
householdRoutes.use('/households/:id', validateHouseholdIdParam)

householdRoutes.use(
  '/households/:id',
  resolveHouseholdMembership((ctx) => ctx.get('requestHouseholdId')),
)

householdRoutes.post('/households', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')
  const body = await readJsonBody<CreateHouseholdRequest>(
    ctx.req.raw,
    createHouseholdRequestSchema(locale),
    locale,
  )

  const result = await createHousehold(ctx.env, currentUser.id, locale, body)

  return success<HouseholdDTO>(ctx, result, 201)
})

householdRoutes.get('/households', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const result = await listHouseholds(ctx.env, currentUser.id)

  return success<ListHouseholdsResponse>(ctx, result)
})

householdRoutes.get('/households/:id', async (ctx) => {
  const locale = ctx.get('locale')
  const { householdId, membership } = getResolvedHouseholdContext(ctx)

  const result = await getHousehold(
    ctx.env,
    householdId,
    membership.role,
    locale,
  )

  return success<HouseholdDTO>(ctx, result)
})

householdRoutes.patch(
  '/households/:id',
  requireRole(['admin']),
  async (ctx) => {
    const locale = ctx.get('locale')
    const { householdId, membership } = getResolvedHouseholdContext(ctx)

    const body = await readJsonBody<UpdateHouseholdRequest>(
      ctx.req.raw,
      updateHouseholdRequestSchema(locale),
      locale,
    )
    const result = await updateHousehold(
      ctx.env,
      householdId,
      membership.role,
      locale,
      body,
    )

    return success<HouseholdDTO>(ctx, result)
  },
)

householdRoutes.delete(
  '/households/:id',
  requireRole(['admin']),
  async (ctx) => {
    const locale = ctx.get('locale')
    const { householdId } = getResolvedHouseholdContext(ctx)
    const result = await archiveHousehold(ctx.env, householdId, locale)

    return success<DeleteHouseholdResponse>(ctx, result)
  },
)
