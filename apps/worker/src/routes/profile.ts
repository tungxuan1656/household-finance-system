import { Hono } from 'hono'

import {
  createUpdateProfileRequestSchema,
  type ProfileResponse,
  type UpdateProfileRequest,
} from '@/contracts'
import { getCurrentProfile } from '@/handlers/profile/get-current-profile'
import { updateCurrentProfile } from '@/handlers/profile/update-current-profile'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const profileRoutes = new Hono<AppBindings>()

profileRoutes.use('/users/me', authMiddleware)

profileRoutes.get('/users/me', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')
  const profile = await getCurrentProfile(ctx.env, currentUser.id, locale)

  return success<ProfileResponse>(ctx, profile)
})

profileRoutes.patch('/users/me', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')
  const body = await readJsonBody<UpdateProfileRequest>(
    ctx.req.raw,
    createUpdateProfileRequestSchema(locale),
    locale,
  )

  const updatedProfile = await updateCurrentProfile(
    ctx.env,
    currentUser.id,
    locale,
    body,
  )

  return success<ProfileResponse>(ctx, updatedProfile)
})
