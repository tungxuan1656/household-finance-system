import { beforeEach, describe, expect, it, vi } from 'vitest'

import { requestUploadSignature } from '@/api/media'
import {
  uploadMediaViaCloudinary,
  uploadToCloudinaryWithSignature,
} from '@/lib/media/cloudinary-upload'
import type { UploadSignatureTicketDTO } from '@/types/media'

vi.mock('@/api/media', () => ({
  requestUploadSignature: vi.fn(),
}))

const requestUploadSignatureMock = vi.mocked(requestUploadSignature)

const createTicket = (): UploadSignatureTicketDTO => ({
  cloudName: 'demo-cloud',
  apiKey: 'demo-key',
  uploadPreset: 'household-finance-system-preset',
  timestamp: 1_700_000_000,
  signature: 'signed-hash',
  folder: 'app/local/user/expense-receipt',
  publicId: 'file-123',
  resourceType: 'image',
  uploadUrl: 'https://api.cloudinary.com/v1_1/demo-cloud/image/upload',
  expiresAt: 1_700_000_300,
  maxBytes: 1024 * 1024,
  allowedMimeTypes: ['image/jpeg'],
})

describe('cloudinary upload helper', () => {
  beforeEach(() => {
    requestUploadSignatureMock.mockReset()
    vi.restoreAllMocks()
  })

  it('sends signed multipart upload fields and maps response payload', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          secure_url: 'https://res.cloudinary.com/demo/image/upload/file-123',
          public_id: 'file-123',
          resource_type: 'image',
          bytes: 4567,
          width: 400,
          height: 300,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )

    const blob = new Blob(['binary'], { type: 'image/jpeg' })
    const ticket = createTicket()
    const uploaded = await uploadToCloudinaryWithSignature({
      file: blob,
      ticket,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe(ticket.uploadUrl)
    expect(init?.method).toBe('POST')
    expect(init?.body).toBeInstanceOf(FormData)

    const formData = init?.body as FormData
    expect(formData.get('api_key')).toBe(ticket.apiKey)
    expect(formData.get('timestamp')).toBe(ticket.timestamp.toString())
    expect(formData.get('signature')).toBe(ticket.signature)
    expect(formData.get('upload_preset')).toBe(ticket.uploadPreset)
    expect(formData.get('folder')).toBe(ticket.folder)
    expect(formData.get('public_id')).toBe(ticket.publicId)

    expect(uploaded).toEqual({
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/file-123',
      publicId: 'file-123',
      resourceType: 'image',
      bytes: 4567,
      width: 400,
      height: 300,
      duration: undefined,
    })
  })

  it('throws cloudinary message when upload returns non-2xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { message: 'Invalid Signature 401' },
        }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      ),
    )

    const blob = new Blob(['binary'], { type: 'image/jpeg' })
    const ticket = createTicket()

    await expect(
      uploadToCloudinaryWithSignature({ file: blob, ticket }),
    ).rejects.toThrow('Invalid Signature 401')
  })

  it('performs 2-step flow: request signature first then upload', async () => {
    const ticket = createTicket()
    requestUploadSignatureMock.mockResolvedValueOnce(ticket)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          secure_url: 'https://res.cloudinary.com/demo/video/upload/file-123',
          public_id: 'file-123',
          resource_type: 'video',
          bytes: 9087,
          duration: 12.4,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )

    const uploaded = await uploadMediaViaCloudinary({
      file: new Blob(['video'], { type: 'video/mp4' }),
      signatureRequest: {
        resourceType: 'video',
        mimeType: 'video/mp4',
        sizeBytes: 9999,
        feature: 'expense-attachment',
      },
    })

    expect(requestUploadSignatureMock).toHaveBeenCalledWith({
      resourceType: 'video',
      mimeType: 'video/mp4',
      sizeBytes: 9999,
      feature: 'expense-attachment',
    })

    expect(uploaded.resourceType).toBe('video')
    expect(uploaded.duration).toBe(12.4)
  })
})
