import { describe, expect, it } from 'vitest'

import {
  SELF,
  exchangeProfileToken,
  parseJson,
  type ApiEnvelope,
} from './profile-patch.test-setup'

describe('Worker integration: profile patch clears', () => {
  it('clears display name and avatar URL on profile patch with null values', async () => {
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-clear:user-profile-clear@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: null,
        avatarUrl: null,
      }),
    })

    const payload =
      await parseJson<
        ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
      >(response)

    expect(response.status).toBe(200)
    expect(payload.data).toMatchObject({
      displayName: null,
      avatarUrl: null,
    })
  })
})
