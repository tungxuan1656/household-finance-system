import { requestUploadSignature } from '@/api/media'
import type {
  CloudinaryUploadedAsset,
  RequestUploadSignaturePayload,
  UploadSignatureTicketDTO,
} from '@/types/media'

type CloudinaryUploadSuccessPayload = {
  secure_url?: unknown
  public_id?: unknown
  resource_type?: unknown
  bytes?: unknown
  width?: unknown
  height?: unknown
  duration?: unknown
}

type CloudinaryUploadErrorPayload = {
  error?: {
    message?: unknown
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseJsonSafely = async (
  response: Response,
): Promise<
  CloudinaryUploadSuccessPayload | CloudinaryUploadErrorPayload | null
> => {
  try {
    return (await response.json()) as
      | CloudinaryUploadSuccessPayload
      | CloudinaryUploadErrorPayload
  } catch {
    return null
  }
}

const toUploadErrorMessage = (
  status: number,
  payload: CloudinaryUploadErrorPayload | null,
) => {
  if (
    payload &&
    isRecord(payload) &&
    isRecord(payload.error) &&
    typeof payload.error.message === 'string'
  ) {
    return payload.error.message
  }

  return `Cloudinary upload failed with status ${status}.`
}

const toUploadedAsset = (
  payload: CloudinaryUploadSuccessPayload,
): CloudinaryUploadedAsset => {
  if (
    typeof payload.secure_url !== 'string' ||
    typeof payload.public_id !== 'string' ||
    (payload.resource_type !== 'image' && payload.resource_type !== 'video') ||
    typeof payload.bytes !== 'number'
  ) {
    throw new Error('Cloudinary upload response is missing required fields.')
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    resourceType: payload.resource_type,
    bytes: payload.bytes,
    width: typeof payload.width === 'number' ? payload.width : undefined,
    height: typeof payload.height === 'number' ? payload.height : undefined,
    duration:
      typeof payload.duration === 'number' ? payload.duration : undefined,
  }
}

export const uploadToCloudinaryWithSignature = async (input: {
  file: Blob
  ticket: UploadSignatureTicketDTO
}): Promise<CloudinaryUploadedAsset> => {
  const formData = new FormData()
  formData.append('file', input.file)
  formData.append('api_key', input.ticket.apiKey)
  formData.append('timestamp', input.ticket.timestamp.toString())
  formData.append('signature', input.ticket.signature)
  formData.append('upload_preset', input.ticket.uploadPreset)
  formData.append('folder', input.ticket.folder)
  formData.append('public_id', input.ticket.publicId)

  const response = await fetch(input.ticket.uploadUrl, {
    method: 'POST',
    body: formData,
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(
      toUploadErrorMessage(
        response.status,
        payload as CloudinaryUploadErrorPayload | null,
      ),
    )
  }

  return toUploadedAsset(payload as CloudinaryUploadSuccessPayload)
}

export const uploadMediaViaCloudinary = async (input: {
  file: Blob
  signatureRequest: RequestUploadSignaturePayload
}): Promise<CloudinaryUploadedAsset> => {
  const ticket = await requestUploadSignature(input.signatureRequest)

  return uploadToCloudinaryWithSignature({
    file: input.file,
    ticket,
  })
}
