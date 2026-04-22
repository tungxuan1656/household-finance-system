import { Hono } from 'hono'

import {
  loadUserById,
  updateUserProfile,
} from '@/db/repositories/user-repository'
import type { AppBindings, ProfileResponse, UpdateProfileRequest } from '@/dto'
import { updateProfileRequestSchema } from '@/dto'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'

const toProfileResponse = (
  user: Awaited<ReturnType<typeof loadUserById>>,
): ProfileResponse => ({
  id: user.id,
  email: user.primaryEmail,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
})

export const profileRoutes = new Hono<AppBindings>()

profileRoutes.use('/profile', authMiddleware)

profileRoutes.get('/profile', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const profile = await loadUserById(ctx.env.DB, currentUser.id)

  return success(ctx, toProfileResponse(profile))
})

profileRoutes.patch('/profile', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const body = await readJsonBody<UpdateProfileRequest>(
    ctx.req.raw,
    updateProfileRequestSchema,
  )

  const updatedProfile = await updateUserProfile(ctx.env.DB, currentUser.id, {
    displayName: body.displayName,
    avatarUrl: body.avatarUrl,
  })

  return success(ctx, toProfileResponse(updatedProfile))
})
