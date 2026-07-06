import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiErrorEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('GET /api/v1/incomes — list errors', () => {
  it('Error: unauthenticated -> 401', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      headers: { 'content-type': 'application/json' },
    })

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })
})
