import type { ZodIssue } from 'zod'

import type { SupportedLocale } from './locales'
import { translate } from './translate'

export interface ValidationDetails {
  formErrors: string[]
  fieldErrors: Record<string, string[]>
}

const translateIssue = (issue: ZodIssue, locale: SupportedLocale): string => {
  const typedIssue = issue as ZodIssue & {
    origin?: string
    format?: string
    minimum?: number
    maximum?: number
  }

  const schemaMessage = issue.message.trim()

  switch (typedIssue.code) {
    case 'invalid_type':
      return translate(locale, 'validation.invalidType')
    case 'invalid_value':
      return translate(locale, 'validation.invalidValue')
    case 'invalid_format':
      if (typedIssue.format === 'url') {
        return translate(locale, 'validation.invalidUrl')
      }

      return translate(locale, 'validation.invalidFormat')
    case 'unrecognized_keys':
      return translate(locale, 'validation.unrecognizedKeys')
    case 'too_small':
      if (schemaMessage.length > 0) {
        return schemaMessage
      }

      if (typedIssue.origin === 'string' && typedIssue.minimum === 1) {
        return translate(locale, 'validation.stringTooSmall')
      }

      if (typedIssue.origin === 'string') {
        return translate(locale, 'validation.stringTooShort')
      }

      if (typedIssue.origin === 'number' || typedIssue.origin === 'bigint') {
        return translate(locale, 'validation.numberTooSmall')
      }

      if (typedIssue.origin === 'array') {
        return translate(locale, 'validation.arrayTooSmall')
      }

      return translate(locale, 'validation.custom')
    case 'too_big':
      if (schemaMessage.length > 0) {
        return schemaMessage
      }

      if (typedIssue.origin === 'string') {
        return translate(locale, 'validation.stringTooBig')
      }

      if (typedIssue.origin === 'number' || typedIssue.origin === 'bigint') {
        return translate(locale, 'validation.numberTooBig')
      }

      if (typedIssue.origin === 'array') {
        return translate(locale, 'validation.arrayTooBig')
      }

      return translate(locale, 'validation.custom')
    case 'custom':
      return issue.message || translate(locale, 'validation.custom')
    default:
      return translate(locale, 'validation.custom')
  }
}

export const formatValidationDetails = (
  issues: ZodIssue[],
  locale: SupportedLocale,
): ValidationDetails => {
  const fieldErrors: Record<string, string[]> = {}
  const formErrors: string[] = []

  for (const issue of issues) {
    const message = translateIssue(issue, locale)
    const path = issue.path.join('.')

    if (!path) {
      formErrors.push(message)
      continue
    }

    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }

    fieldErrors[path].push(message)
  }

  return {
    formErrors,
    fieldErrors,
  }
}
