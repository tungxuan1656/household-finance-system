import type {
  UploadSignatureRequest,
  UploadSignatureResponse,
} from '@/contracts'
import { readCloudinaryConfig } from '@/lib/env'
import type { SupportedLocale } from '@/lib/i18n'
import { createUploadSignature } from '@/lib/media/cloudinary'
import type { AppBindings } from '@/types'

export const createMediaUploadSignature = (
  env: AppBindings['Bindings'],
  userId: string,
  locale: SupportedLocale,
  input: UploadSignatureRequest,
): UploadSignatureResponse =>
  createUploadSignature({
    appConfig: readCloudinaryConfig(env),
    locale,
    request: input,
    userId,
  })
