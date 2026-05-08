import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: households create and list', () => {
  it('creates a household for the authenticated user', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-household-create:user-household-create@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/households', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Gia Dinh Toi',
      }),
    })

    const payload = await parseJson<
      import('../helpers/test-context').ApiEnvelope<{
        id: string
        name: string
        slug: string
        defaultCurrencyCode: string
        timezone: string
        role: 'admin' | 'member'
        createdAt: number
      }>
    >(response)

    expect(response.status).toBe(201)
    expect(payload.data).toMatchObject({
      name: 'Gia Dinh Toi',
      slug: 'gia-dinh-toi',
      defaultCurrencyCode: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
      role: 'admin',
    })
    expect(typeof payload.data.createdAt).toBe('number')
  })

  it('lists caller households with role', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-household-list:user-household-list@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Family Alpha',
          defaultCurrencyCode: 'usd',
        }),
      },
    )
    expect(createResponse.status).toBe(201)

    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )
    const listPayload = await parseJson<
      import('../helpers/test-context').ApiEnvelope<{
        items: Array<{
          id: string
          name: string
          role: 'admin' | 'member'
        }>
      }>
    >(listResponse)

    expect(listResponse.status).toBe(200)
    expect(listPayload.data.items).toHaveLength(1)
    expect(listPayload.data.items[0]).toMatchObject({
      name: 'Family Alpha',
      role: 'admin',
    })
  })

  it('rejects household create when request body is invalid', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-household-invalid:user-household-invalid@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/households', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: '   ',
        defaultCurrencyCode: 'US',
      }),
    })
    const payload =
      await parseJson<import('../helpers/test-context').ApiErrorEnvelope>(
        response,
      )

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects household list when bearer token is missing', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/households')
    const payload =
      await parseJson<import('../helpers/test-context').ApiErrorEnvelope>(
        response,
      )

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })
})
