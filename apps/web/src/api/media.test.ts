import { beforeEach, describe, expect, it, vi } from 'vitest'

import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import { requestUploadSignature } from '@/api/media'
import type { UploadSignatureTicketDTO } from '@/types/media'

vi.mock('@/api/client', () => ({
  client: {
    post: vi.fn(),
  },
}))

const postMock = vi.mocked(client.post)

describe('media api', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it('requests upload signature ticket through protected media endpoint', async () => {
    const ticket: UploadSignatureTicketDTO = {
      cloudName: 'demo-cloud',
      apiKey: 'demo-key',
      uploadPreset: 'household-finance-system-preset',
      timestamp: 1_700_000_000,
      signature: 'signed',
      folder: 'app/local/user/expense-receipt',
      publicId: 'abc',
      resourceType: 'image',
      uploadUrl: 'https://api.cloudinary.com/v1_1/demo-cloud/image/upload',
      expiresAt: 1_700_000_300,
      maxBytes: 1024,
      allowedMimeTypes: ['image/jpeg'],
    }

    postMock.mockResolvedValueOnce({ data: ticket })

    const payload = await requestUploadSignature({
      resourceType: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 1000,
      feature: 'expense-receipt',
      extension: 'jpg',
    })

    expect(postMock).toHaveBeenCalledWith(API_ENDPOINTS.media.uploadSignature, {
      resourceType: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 1000,
      feature: 'expense-receipt',
      extension: 'jpg',
    })

    expect(payload).toEqual(ticket)
  })
})
