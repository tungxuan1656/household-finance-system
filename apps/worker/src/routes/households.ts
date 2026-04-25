import { Hono } from 'hono'

import {
  type CreateHouseholdRequest,
  createHouseholdRequestSchema,
  type DeleteHouseholdResponse,
  type HouseholdDTO,
  householdPathParamsSchema,
  type ListHouseholdsResponse,
  type UpdateHouseholdRequest,
  updateHouseholdRequestSchema,
} from '@/contracts'
import { archiveHousehold } from '@/handlers/households/archive-household'
import { createHousehold } from '@/handlers/households/create-household'
import { getHousehold } from '@/handlers/households/get-household'
import { listHouseholds } from '@/handlers/households/list-households'
import { updateHousehold } from '@/handlers/households/update-household'
import { invalidInput } from '@/lib/errors'
import { formatValidationDetails } from '@/lib/i18n'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const householdRoutes = new Hono<AppBindings>()

householdRoutes.use('/households/*', authMiddleware)
householdRoutes.use('/households', authMiddleware)

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
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')
  const parsedParams = householdPathParamsSchema(locale).safeParse({
    id: ctx.req.param('id'),
  })

  if (!parsedParams.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(parsedParams.error.issues, locale),
    )
  }

  const result = await getHousehold(
    ctx.env,
    currentUser.id,
    parsedParams.data.id,
    locale,
  )

  return success<HouseholdDTO>(ctx, result)
})

householdRoutes.patch('/households/:id', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')
  const parsedParams = householdPathParamsSchema(locale).safeParse({
    id: ctx.req.param('id'),
  })

  if (!parsedParams.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(parsedParams.error.issues, locale),
    )
  }

  const body = await readJsonBody<UpdateHouseholdRequest>(
    ctx.req.raw,
    updateHouseholdRequestSchema(locale),
    locale,
  )
  const result = await updateHousehold(
    ctx.env,
    currentUser.id,
    parsedParams.data.id,
    locale,
    body,
  )

  return success<HouseholdDTO>(ctx, result)
})

householdRoutes.delete('/households/:id', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')
  const parsedParams = householdPathParamsSchema(locale).safeParse({
    id: ctx.req.param('id'),
  })

  if (!parsedParams.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(parsedParams.error.issues, locale),
    )
  }

  const result = await archiveHousehold(
    ctx.env,
    currentUser.id,
    parsedParams.data.id,
    locale,
  )

  return success<DeleteHouseholdResponse>(ctx, result)
})
