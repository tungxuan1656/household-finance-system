import type { ZodSchema } from 'zod'

import { invalidInput } from '@/lib/errors'
import {
  defaultLocale,
  formatValidationDetails,
  type SupportedLocale,
} from '@/lib/i18n'

const MAX_BODY_BYTES = 1_048_576

export const readJsonBody = async <T>(
  request: Request,
  schema: ZodSchema<T>,
  locale: SupportedLocale = defaultLocale,
): Promise<T> => {
  let rawBody: unknown

  const contentLength = request.headers.get('content-length')

  if (contentLength !== null && Number(contentLength) > MAX_BODY_BYTES) {
    throw invalidInput(locale, 'errors.invalidRequestBody')
  }

  if (contentLength === null) {
    const text = await request.text()

    if (text.length > MAX_BODY_BYTES) {
      throw invalidInput(locale, 'errors.invalidRequestBody')
    }

    try {
      rawBody = JSON.parse(text)
    } catch {
      throw invalidInput(locale, 'errors.invalidJsonBody')
    }
  } else {
    try {
      rawBody = await request.json()
    } catch {
      throw invalidInput(locale, 'errors.invalidJsonBody')
    }
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
