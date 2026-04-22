import type { ZodSchema } from 'zod'

import { invalidInput } from '@/lib/errors'

export const readJsonBody = async <T>(
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
