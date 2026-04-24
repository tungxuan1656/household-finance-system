import { Hono } from 'hono'

import {
  createUploadSignatureRequestSchema,
  type UploadSignatureRequest,
  type UploadSignatureResponse,
} from '@/contracts'
import { createMediaUploadSignature } from '@/handlers/media/create-upload-signature'
import { success } from '@/lib/response'
import { readJsonBody } from '@/lib/validation'
import { authMiddleware } from '@/middlewares/auth'
import type { AppBindings } from '@/types'

export const mediaRoutes = new Hono<AppBindings>()

mediaRoutes.use('/media/*', authMiddleware)

mediaRoutes.post('/media/upload-signature', async (ctx) => {
  const currentUser = ctx.get('currentUser')
  const locale = ctx.get('locale')
  const body = await readJsonBody<UploadSignatureRequest>(
    ctx.req.raw,
    createUploadSignatureRequestSchema(locale),
    locale,
  )

  const payload = createMediaUploadSignature(
    ctx.env,
    currentUser.id,
    locale,
    body,
  )

  return success<UploadSignatureResponse>(ctx, payload)
})
