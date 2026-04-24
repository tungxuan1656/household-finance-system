import { describe, expect, it } from 'vitest'

import { createUploadSignatureRequestSchema } from '@/contracts'

describe('media upload signature contract schema', () => {
  it('accepts valid image payload', () => {
    const parsed = createUploadSignatureRequestSchema().safeParse({
      resourceType: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 512_000,
      feature: 'profile-avatar',
    })

    expect(parsed.success).toBe(true)
  })

  it('rejects invalid feature format', () => {
    const parsed = createUploadSignatureRequestSchema().safeParse({
      resourceType: 'video',
      mimeType: 'video/mp4',
      sizeBytes: 1024,
      feature: '../../escape',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects invalid mime type format', () => {
    const parsed = createUploadSignatureRequestSchema().safeParse({
      resourceType: 'image',
      mimeType: 'jpeg',
      sizeBytes: 1024,
      feature: 'expense-receipt',
    })

    expect(parsed.success).toBe(false)
  })

  it('rejects invalid extension', () => {
    const parsed = createUploadSignatureRequestSchema().safeParse({
      resourceType: 'image',
      mimeType: 'image/png',
      sizeBytes: 1024,
      feature: 'expense-receipt',
      extension: '.png',
    })

    expect(parsed.success).toBe(false)
  })
})
