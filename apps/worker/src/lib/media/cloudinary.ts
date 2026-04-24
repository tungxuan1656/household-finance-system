import { createHash } from 'node:crypto'

import { ulid } from 'ulid'

import type {
  UploadSignatureRequest,
  UploadSignatureResponse,
} from '@/contracts'
import { invalidInput } from '@/lib/errors'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppConfig } from '@/types'

const DEFAULT_ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
] as const

const DEFAULT_ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
] as const

const SIGNATURE_TTL_SECONDS = 5 * 60
const CLOUDINARY_UPLOAD_PRESET = 'household-finance-system-preset'

type SignableCloudinaryParams = {
  folder: string
  public_id: string
  timestamp: number
  upload_preset: string
}

type UploadPolicy = {
  maxBytes: number
  allowedMimeTypes: string[]
}

const sanitizePathSegment = (value: string): string =>
  value.replaceAll(/[^a-zA-Z0-9_-]/g, '-')

const canonicalizeCloudinaryParams = (
  params: SignableCloudinaryParams,
): string =>
  Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

const signCloudinaryParams = (
  params: SignableCloudinaryParams,
  apiSecret: string,
): string =>
  createHash('sha1')
    .update(`${canonicalizeCloudinaryParams(params)}${apiSecret}`)
    .digest('hex')

const resolveUploadPolicy = (
  config: AppConfig,
  resourceType: UploadSignatureRequest['resourceType'],
): UploadPolicy =>
  resourceType === 'image'
    ? {
        maxBytes: config.cloudinaryMaxImageBytes,
        allowedMimeTypes:
          config.cloudinaryAllowedImageMimeTypes.length > 0
            ? config.cloudinaryAllowedImageMimeTypes
            : [...DEFAULT_ALLOWED_IMAGE_MIME_TYPES],
      }
    : {
        maxBytes: config.cloudinaryMaxVideoBytes,
        allowedMimeTypes:
          config.cloudinaryAllowedVideoMimeTypes.length > 0
            ? config.cloudinaryAllowedVideoMimeTypes
            : [...DEFAULT_ALLOWED_VIDEO_MIME_TYPES],
      }

const assertWithinPolicy = (
  input: UploadSignatureRequest,
  policy: UploadPolicy,
  locale: SupportedLocale,
) => {
  if (input.sizeBytes > policy.maxBytes) {
    throw invalidInput(locale, 'errors.invalidRequestBody', {
      field: 'sizeBytes',
      maxBytes: policy.maxBytes,
    })
  }

  if (!policy.allowedMimeTypes.includes(input.mimeType.toLowerCase())) {
    throw invalidInput(locale, 'errors.invalidRequestBody', {
      allowedMimeTypes: policy.allowedMimeTypes,
      field: 'mimeType',
      provided: input.mimeType,
    })
  }
}

export const createUploadSignature = (input: {
  appConfig: AppConfig
  locale: SupportedLocale
  request: UploadSignatureRequest
  userId: string
}): UploadSignatureResponse => {
  const policy = resolveUploadPolicy(
    input.appConfig,
    input.request.resourceType,
  )

  assertWithinPolicy(input.request, policy, input.locale)

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = `app/${sanitizePathSegment(input.appConfig.appEnvironment)}/${sanitizePathSegment(input.userId)}/${sanitizePathSegment(input.request.feature)}`

  const basePublicId = ulid().toLowerCase()
  const publicId = input.request.extension
    ? `${basePublicId}.${input.request.extension}`
    : basePublicId

  const signableParams: SignableCloudinaryParams = {
    folder,
    public_id: publicId,
    timestamp,
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
  }

  const signature = signCloudinaryParams(
    signableParams,
    input.appConfig.cloudinaryApiSecret,
  )

  return {
    cloudName: input.appConfig.cloudinaryCloudName,
    apiKey: input.appConfig.cloudinaryApiKey,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    timestamp,
    signature,
    folder,
    publicId,
    resourceType: input.request.resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${input.appConfig.cloudinaryCloudName}/${input.request.resourceType}/upload`,
    expiresAt: timestamp + SIGNATURE_TTL_SECONDS,
    maxBytes: policy.maxBytes,
    allowedMimeTypes: policy.allowedMimeTypes,
  }
}

export { canonicalizeCloudinaryParams, signCloudinaryParams }
