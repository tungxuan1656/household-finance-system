import type { Context, MiddlewareHandler } from 'hono'

import { householdPathParamsSchema } from '@/contracts'
import { findActiveHouseholdMembership } from '@/db/repositories/household-membership-repository'
import { forbidden, invalidInput, notFound } from '@/lib/errors'
import { formatValidationDetails } from '@/lib/i18n'
import type { AppBindings, HouseholdRole } from '@/types'

type HouseholdIdResolver = (ctx: Context<AppBindings>) => string | undefined

export const validateHouseholdIdParam: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
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

  ctx.set('requestHouseholdId', parsedParams.data.id)
  await next()
}

export const resolveHouseholdMembership =
  (resolveHouseholdId: HouseholdIdResolver): MiddlewareHandler<AppBindings> =>
  async (ctx, next) => {
    const locale = ctx.get('locale')
    const householdId = resolveHouseholdId(ctx)

    if (!householdId) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    const currentUser = ctx.get('currentUser')
    const membership = await findActiveHouseholdMembership(
      ctx.env.DB,
      currentUser.id,
      householdId,
    )

    if (!membership) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    ctx.set('currentHouseholdId', membership.householdId)
    ctx.set('currentHouseholdMembership', membership)

    await next()
  }

export const requireRole = (
  roles: HouseholdRole[],
): MiddlewareHandler<AppBindings> => {
  const allowedRoles = new Set(roles)

  return async (ctx, next) => {
    const locale = ctx.get('locale')
    const membership = ctx.get('currentHouseholdMembership')

    if (!membership) {
      throw notFound(locale, 'errors.resourceNotFound')
    }

    if (!allowedRoles.has(membership.role)) {
      throw forbidden(locale, 'errors.forbidden')
    }

    await next()
  }
}

export const validateTargetUserIdParam: MiddlewareHandler<AppBindings> = async (
  ctx,
  next,
) => {
  const targetUserId = ctx.req.param('userId')

  if (!targetUserId || targetUserId.trim().length === 0) {
    throw notFound(ctx.get('locale'), 'errors.resourceNotFound')
  }

  ctx.set('requestTargetUserId', targetUserId.trim())
  await next()
}
