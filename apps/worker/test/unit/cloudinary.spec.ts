import { describe, expect, it } from 'vitest'

import { createUploadSignature } from '@/lib/media/cloudinary'
import {
  canonicalizeCloudinaryParams,
  signCloudinaryParams,
} from '@/lib/media/cloudinary'
import type { AppConfig } from '@/types'

const appConfig: AppConfig = {
  authIssuer: 'https://example.com',
  authAudience: 'api',
  accessTokenTtlSeconds: 3600,
  refreshTokenTtlSeconds: 86_400,
  authJwtSecret: 'jwt-secret',
  refreshTokenPepper: 'pepper',
  firebaseProjectId: 'project',
  firebaseJwksUrl: 'https://jwks.example.com',
  allowInsecureTestTokens: false,
  appEnvironment: 'local',
  cloudinaryCloudName: 'demo-cloud',
  cloudinaryApiKey: 'demo-key',
  cloudinaryApiSecret: 'test-secret',
  cloudinaryMaxImageBytes: 10 * 1024 * 1024,
  cloudinaryMaxVideoBytes: 100 * 1024 * 1024,
  cloudinaryAllowedImageMimeTypes: ['image/jpeg', 'image/png'],
  cloudinaryAllowedVideoMimeTypes: ['video/mp4'],
}

describe('cloudinary upload signing', () => {
  it('canonicalizes signable params in lexicographic key order', () => {
    const canonical = canonicalizeCloudinaryParams({
      folder: 'app/local/user-1/expense_receipt',
      public_id: 'abc123',
      timestamp: 1_700_000_000,
      upload_preset: 'household-finance-system-preset',
    })

    expect(canonical).toBe(
      'folder=app/local/user-1/expense_receipt&public_id=abc123&timestamp=1700000000&upload_preset=household-finance-system-preset',
    )
  })

  it('generates expected SHA-1 signature for a known fixture', () => {
    const signature = signCloudinaryParams(
      {
        folder: 'app/local/user-1/expense_receipt',
        public_id: 'abc123',
        timestamp: 1_700_000_000,
        upload_preset: 'household-finance-system-preset',
      },
      'test-secret',
    )

    expect(signature).toBe('f47c367b2c8231b79f8db25e1c3b911d48edc5ff')
  })

  it('rejects unsupported mime type from policy', () => {
    expect(() =>
      createUploadSignature({
        appConfig,
        locale: 'vi',
        userId: 'user-1',
        request: {
          resourceType: 'image',
          mimeType: 'image/heif',
          sizeBytes: 2000,
          feature: 'expense-receipt',
        },
      }),
    ).toThrowError(
      expect.objectContaining({
        code: 'INVALID_INPUT',
      }),
    )
  })

  it('returns signing payload for valid video request', () => {
    const payload = createUploadSignature({
      appConfig,
      locale: 'vi',
      userId: 'user-1',
      request: {
        resourceType: 'video',
        mimeType: 'video/mp4',
        sizeBytes: 1024,
        feature: 'expense-attachment',
      },
    })

    expect(payload.resourceType).toBe('video')
    expect(payload.uploadUrl).toBe(
      'https://api.cloudinary.com/v1_1/demo-cloud/video/upload',
    )
    expect(payload.uploadPreset).toBe('household-finance-system-preset')
    expect(payload.folder).toBe('app/local/user-1/expense-attachment')
    expect(payload.allowedMimeTypes).toEqual(['video/mp4'])
  })
})
