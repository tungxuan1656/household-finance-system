import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: media upload signature', () => {
  it('returns upload signature payload for authenticated image upload request', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-media-signature:user-media-signature@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch(
      'https://example.com/api/v1/media/upload-signature',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: 'image',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          feature: 'expense-receipt',
          extension: 'jpg',
        }),
      },
    )

    const payload = await parseJson<
      ApiEnvelope<{
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
        maxFileSize: number
        allowedFormats: string[]
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(payload.data.cloudName).toBe('demo-cloud')
    expect(payload.data.apiKey).toBe('demo-key')
    expect(payload.data.uploadPreset).toBe('household-finance-system-preset')
    expect(payload.data.resourceType).toBe('image')
    expect(payload.data.uploadUrl).toBe(
      'https://api.cloudinary.com/v1_1/demo-cloud/image/upload',
    )
    expect(payload.data.folder).toContain('/expense-receipt')
    expect(payload.data.publicId.endsWith('.jpg')).toBe(true)
    expect(payload.data.signature.length).toBe(40)
    expect(payload.data.expiresAt).toBeGreaterThan(payload.data.timestamp)
    expect(payload.data.maxBytes).toBeGreaterThan(0)
    expect(payload.data.maxFileSize).toBe(1024)
    expect(payload.data.allowedMimeTypes).toContain('image/jpeg')
    expect(payload.data.allowedFormats).toContain('jpg')
    expect(payload.data.allowedFormats).not.toContain('png')
  })

  it('rejects media upload signature request when bearer token is missing', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/media/upload-signature',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: 'image',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          feature: 'expense-receipt',
        }),
      },
    )

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects media upload signature request for unsupported mime type', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-media-invalid-mime:user-media-invalid-mime@example.com',
        }),
      },
    )

    const exchangePayload =
      await parseJson<ApiEnvelope<{ accessToken: string }>>(exchangeResponse)

    const response = await SELF.fetch(
      'https://example.com/api/v1/media/upload-signature',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: 'video',
          mimeType: 'video/ogg',
          sizeBytes: 4096,
          feature: 'expense-receipt',
        }),
      },
    )

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })
})
