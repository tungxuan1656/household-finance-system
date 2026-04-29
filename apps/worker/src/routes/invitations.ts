import { Hono } from 'hono'

import {
  type AcceptInvitationResponse,
  type CreateInvitationRequest,
  createInvitationRequestSchema,
  type InvitationCreateResponse,
  type InvitationPreviewResponse,
  invitationTokenPathParamsSchema,
} from '@/contracts'
import { acceptInvitation } from '@/handlers/invitations/accept-invitation'
import { createInvitation } from '@/handlers/invitations/create-household-invitation'
import { getInvitationPreview } from '@/handlers/invitations/get-invitation-preview'
import { invalidInput, notFound } from '@/lib/errors'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'
import {
  requireRole,
  resolveHouseholdMembership,
  validateHouseholdIdParam,
} from '@/middlewares/household-membership'
import type { AppBindings } from '@/types'

export const invitationRoutes = new Hono<AppBindings>()

invitationRoutes.use('/households/:id/invitations', authMiddleware)
invitationRoutes.use('/households/:id/invitations', validateHouseholdIdParam)

invitationRoutes.use(
  '/households/:id/invitations',
  resolveHouseholdMembership((ctx) => ctx.get('requestHouseholdId')),
)

invitationRoutes.post(
  '/households/:id/invitations',
  requireRole(['admin']),
  async (ctx) => {
    const locale = ctx.get('locale')
    const currentUser = ctx.get('currentUser')
    const householdId = ctx.get('currentHouseholdId')
    if (!householdId) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    const body = await readJsonBody<CreateInvitationRequest>(
      ctx.req.raw,
      createInvitationRequestSchema(locale),
      locale,
    )

    const result = await createInvitation(ctx.env, {
      actorUserId: currentUser.id,
      householdId,
      payload: body,
    })

    return success<InvitationCreateResponse>(ctx, result, 201)
  },
)

invitationRoutes.get('/invitations/:token', async (ctx) => {
  const locale = ctx.get('locale')
  const parsed = invitationTokenPathParamsSchema(locale).safeParse({
    token: ctx.req.param('token'),
  })

  if (!parsed.success) {
    throw invalidInput(locale, 'errors.invalidRequestBody', parsed.error.issues)
  }

  const result = await getInvitationPreview(ctx.env, parsed.data.token, locale)

  return success<InvitationPreviewResponse>(ctx, result)
})

invitationRoutes.use('/invitations/:token/accept', authMiddleware)

invitationRoutes.post('/invitations/:token/accept', async (ctx) => {
  const locale = ctx.get('locale')
  const currentUser = ctx.get('currentUser')
  const parsed = invitationTokenPathParamsSchema(locale).safeParse({
    token: ctx.req.param('token'),
  })

  if (!parsed.success) {
    throw invalidInput(locale, 'errors.invalidRequestBody', parsed.error.issues)
  }

  const result = await acceptInvitation(ctx.env, {
    token: parsed.data.token,
    userId: currentUser.id,
    locale,
  })

  return success<AcceptInvitationResponse>(ctx, result)
})
