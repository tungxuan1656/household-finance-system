import type { AppError } from '@/lib/errors'
import { type ERROR_CODES } from '@/lib/errors'
import { unauthenticated } from '@/lib/errors'

const encoder = new TextEncoder()

/**
 * Constant-time compare of two strings to prevent timing attacks.
 * Returns true when both strings are equal in length and content.
 */
const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false
  }

  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  let result = 0

  for (let i = 0; i < aBytes.length; i += 1) {
    result |= aBytes[i] ^ bBytes[i]
  }

  return result === 0
}

/**
 * Verify the incoming webhook secret token against the expected value.
 * Returns the verified secret string on success, throws AppError on mismatch.
 */
export const verifyWebhookSecret = (
  expected: string,
  actual: string | null | undefined,
): string => {
  if (!actual || !constantTimeEqual(expected, actual)) {
    throw unauthenticated(undefined, 'errors.authenticationRequired')
  }

  return actual
}

/**
 * For tests: verifyWebhookSecret returns a typed error.
 */
export type WebhookSecretError = AppError & {
  code: typeof ERROR_CODES.UNAUTHENTICATED
}
