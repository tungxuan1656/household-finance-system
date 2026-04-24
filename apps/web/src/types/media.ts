export type UploadResourceType = 'image' | 'video'

export type RequestUploadSignaturePayload = {
  resourceType: UploadResourceType
  mimeType: string
  sizeBytes: number
  feature: string
  extension?: string
  originalFilename?: string
}

export type UploadSignatureTicketDTO = {
  cloudName: string
  apiKey: string
  uploadPreset: string
  timestamp: number
  signature: string
  folder: string
  publicId: string
  resourceType: UploadResourceType
  uploadUrl: string
  expiresAt: number
  maxBytes: number
  allowedMimeTypes: string[]
}

export type CloudinaryUploadedAsset = {
  secureUrl: string
  publicId: string
  resourceType: UploadResourceType
  bytes: number
  width?: number
  height?: number
  duration?: number
}
