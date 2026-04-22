import { Hono } from 'hono'

import type { AppBindings, ProfileResponse, UpdateProfileRequest } from '@/dto'
import { updateProfileRequestSchema } from '@/dto'
import { getCurrentProfile } from '@/handlers/profile/get-current-profile'
import { updateCurrentProfile } from '@/handlers/profile/update-current-profile'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'

export const profileRoutes = new Hono<AppBindings>()

profileRoutes.use('/profile', authMiddleware)

profileRoutes.get('/profile', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const profile = await getCurrentProfile(ctx.env, currentUser.id)

  return success<ProfileResponse>(ctx, profile)
})

profileRoutes.patch('/profile', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const body = await readJsonBody<UpdateProfileRequest>(
    ctx.req.raw,
    updateProfileRequestSchema,
  )

  const updatedProfile = await updateCurrentProfile(
    ctx.env,
    currentUser.id,
    body,
  )

  return success<ProfileResponse>(ctx, updatedProfile)
})
