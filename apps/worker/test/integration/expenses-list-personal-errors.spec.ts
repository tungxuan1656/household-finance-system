import { describe, expect, it } from 'vitest'

import {
  SELF,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
} from './expenses-list-personal.test-setup'

describe('GET /api/v1/expenses personal errors', () => {
  it('returns 401 when listing without authentication', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/expenses')

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns 400 for invalid limit parameter', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-invalid-limit:list-invalid-limit@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses?limit=0',
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })
})
