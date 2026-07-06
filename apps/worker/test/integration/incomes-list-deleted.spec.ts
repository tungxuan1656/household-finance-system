import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('GET /api/v1/incomes — soft-deleted exclusion', () => {
  it('excludes soft-deleted incomes from list results', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-deleted:inc-deleted@example.com',
    )

    const createdResponse = await SELF.fetch(
      'https://example.com/api/v1/incomes',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1500000,
          sourceKey: 'cash',
          title: 'Deleted income',
          occurredAt: Date.now(),
        }),
      },
    )

    expect(createdResponse.status).toBe(201)

    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createdResponse)

    await env.DB.prepare('UPDATE incomes SET deleted_at = ? WHERE id = ?')
      .bind(Date.now(), createdPayload.data.id)
      .run()

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      headers: { authorization: `Bearer ${auth.accessToken}` },
    })

    expect(response.status).toBe(200)

    const payload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ id: string }>; nextCursor: string | null }>
      >(response)

    expect(payload.data.items).toHaveLength(0)
  })
})
