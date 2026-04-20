import { Hono } from 'hono'
import type { ZodSchema } from 'zod'

import {
  loadUserById,
  updateUserProfile,
} from '@/db/repositories/user-repository'
import type { AppBindings, ProfileResponse, UpdateProfileRequest } from '@/dto'
import { updateProfileRequestSchema } from '@/dto'
import { invalidInput } from '@/lib/errors'
import { success } from '@/lib/response'
import { authMiddleware } from '@/middlewares/auth'

const readJsonBody = async <T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<T> => {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    throw invalidInput('Request body must be valid JSON.')
  }

  const parsed = schema.safeParse(rawBody)

  if (!parsed.success) {
    throw invalidInput(
      'Request body failed validation.',
      parsed.error.flatten(),
    )
  }

  return parsed.data
}

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
  await loadUserById(ctx.env.DB, currentUser.id)

  const updatedProfile = await updateUserProfile(ctx.env.DB, currentUser.id, {
    displayName: body.displayName,
    avatarUrl: body.avatarUrl,
  })

  return success(ctx, toProfileResponse(updatedProfile))
})
