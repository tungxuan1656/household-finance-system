import { describe, expect, it } from 'vitest'

import { AppError } from '@/lib/errors'
import { verifyWebhookSecret } from '@/bot/webhook-security'

describe('webhook-security', () => {
  it('accepts matching secret', () => {
    const result = verifyWebhookSecret('my-secret', 'my-secret')

    expect(result).toBe('my-secret')
  })

  it('rejects mismatched secret', () => {
    expect(() => verifyWebhookSecret('expected', 'wrong')).toThrow(AppError)
  })

  it('rejects null secret', () => {
    expect(() => verifyWebhookSecret('expected', null)).toThrow(AppError)
  })

  it('rejects undefined secret', () => {
    expect(() => verifyWebhookSecret('expected', undefined)).toThrow(AppError)
  })

  it('rejects empty string secret', () => {
    expect(() => verifyWebhookSecret('expected', '')).toThrow(AppError)
  })

  it('uses constant-time compare (equal-length mismatch)', () => {
    expect(() => verifyWebhookSecret('secret123', 'SECRET123')).toThrow(
      AppError,
    )
  })

  it('throws UNAUTHENTICATED error code', () => {
    try {
      verifyWebhookSecret('a', 'b')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('UNAUTHENTICATED')
    }
  })
})
