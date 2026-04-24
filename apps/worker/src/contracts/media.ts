import { z } from 'zod'

import { defaultLocale, type SupportedLocale, translate } from '@/lib/i18n'

const featurePattern = /^[a-z0-9][a-z0-9/_-]{0,62}$/
const extensionPattern = /^[a-z0-9]{1,10}$/
const mimeTypePattern =
  /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i

export const createUploadSignatureRequestSchema = (
  locale: SupportedLocale = defaultLocale,
) =>
  z
    .object({
      resourceType: z.enum(['image', 'video']),
      mimeType: z
        .string()
        .trim()
        .min(1, translate(locale, 'validation.stringTooSmall'))
        .max(150, translate(locale, 'validation.stringTooBig'))
        .regex(mimeTypePattern, translate(locale, 'validation.invalidFormat')),
      sizeBytes: z
        .number({
          error: (issue) =>
            issue.code === 'invalid_type'
              ? translate(locale, 'validation.invalidType')
              : translate(locale, 'validation.invalidValue'),
        })
        .int(translate(locale, 'validation.invalidValue'))
        .positive(translate(locale, 'validation.numberTooSmall')),
      feature: z
        .string()
        .trim()
        .min(1, translate(locale, 'validation.stringTooSmall'))
        .max(63, translate(locale, 'validation.stringTooBig'))
        .regex(featurePattern, translate(locale, 'validation.invalidFormat')),
      extension: z
        .string()
        .trim()
        .toLowerCase()
        .regex(extensionPattern, translate(locale, 'validation.invalidFormat'))
        .optional(),
      originalFilename: z
        .string()
        .trim()
        .min(1, translate(locale, 'validation.stringTooSmall'))
        .max(255, translate(locale, 'validation.stringTooBig'))
        .optional(),
    })
    .strict()

export const uploadSignatureRequestSchema = createUploadSignatureRequestSchema()

export type UploadSignatureRequest = z.infer<
  typeof uploadSignatureRequestSchema
>

export interface UploadSignatureResponse {
  cloudName: string
  apiKey: string
  uploadPreset: string
  timestamp: number
  signature: string
  folder: string
  publicId: string
  resourceType: 'image' | 'video'
  uploadUrl: string
  expiresAt: number
  maxBytes: number
  allowedMimeTypes: string[]
}
