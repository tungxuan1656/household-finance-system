import type { ZodSchema } from 'zod'

import { invalidInput } from '@/lib/errors'
import {
  defaultLocale,
  formatValidationDetails,
  type SupportedLocale,
} from '@/lib/i18n'

export const readJsonBody = async <T>(
  request: Request,
  schema: ZodSchema<T>,
  locale: SupportedLocale = defaultLocale,
): Promise<T> => {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    throw invalidInput(locale, 'errors.invalidJsonBody')
  }

  const parsed = schema.safeParse(rawBody)

  if (!parsed.success) {
    throw invalidInput(
      locale,
      'errors.invalidRequestBody',
      formatValidationDetails(parsed.error.issues, locale),
    )
  }

  return parsed.data
}
