import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  RequestUploadSignaturePayload,
  UploadSignatureTicketDTO,
} from '@/types/media'

export const requestUploadSignature = async (
  payload: RequestUploadSignaturePayload,
) => {
  const response = await client.post<UploadSignatureTicketDTO>(
    API_ENDPOINTS.media.uploadSignature,
    payload,
  )

  return response.data
}
