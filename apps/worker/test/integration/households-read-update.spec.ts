import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import { insertHouseholdFixture } from '../helpers/household-fixtures'
import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: households read and update', () => {
  it('returns one household by id for an active member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-get:owner-household-get@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Family Bravo',
          defaultCurrencyCode: 'usd',
        }),
      },
    )
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const getResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      { headers: { authorization: `Bearer ${owner.accessToken}` } },
    )
    const getPayload =
      await parseJson<ApiEnvelope<{ id: string; name: string }>>(getResponse)

    expect(getResponse.status).toBe(200)
    expect(getPayload.data).toMatchObject({
      id: createdPayload.data.id,
      name: 'Family Bravo',
    })
  })

  it('returns not found when caller accesses a household they do not belong to', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-owner:user-household-owner@example.com',
    )
    const outsider = await exchangeAccessToken(
      'test:firebase-user-household-outsider:user-household-outsider@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Family Charlie',
          defaultCurrencyCode: 'usd',
        }),
      },
    )
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const response = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      { headers: { authorization: `Bearer ${outsider.accessToken}` } },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('updates a household for an admin member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-update-owner:update-owner@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Family Delta',
          defaultCurrencyCode: 'usd',
        }),
      },
    )
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const updateResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Family Delta Updated',
          defaultCurrencyCode: 'vnd',
        }),
      },
    )
    const updatePayload =
      await parseJson<
        ApiEnvelope<{ id: string; name: string; defaultCurrencyCode: string }>
      >(updateResponse)

    expect(updateResponse.status).toBe(200)
    expect(updatePayload.data).toMatchObject({
      id: createdPayload.data.id,
      name: 'Family Delta Updated',
      defaultCurrencyCode: 'VND',
    })
  })

  it('rejects household update when request body is invalid', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-update-invalid:update-invalid@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Family Echo',
          defaultCurrencyCode: 'usd',
        }),
      },
    )
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const updateResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    )
    const updatePayload = await parseJson<ApiErrorEnvelope>(updateResponse)

    expect(updateResponse.status).toBe(400)
    expect(updatePayload.error.code).toBe('INVALID_INPUT')
  })

  it('returns forbidden when non-admin member updates household', async () => {
    await insertHouseholdFixture(env.DB)

    const member = await exchangeAccessToken(
      'test:firebase-user-household-member-update:member@example.com',
    )
    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state) VALUES (?, ?, ?, ?, ?)`,
    )
      .bind('hm-member-update', 'h1', member.user.id, 'member', 'active')
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/households/h1',
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Should Not Update' }),
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('updates a household with timezone', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-settings-update:settings-update@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Settings' }),
      },
    )
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const updateResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          timezone: 'Asia/Ho_Chi_Minh',
        }),
      },
    )
    const updatePayload =
      await parseJson<ApiEnvelope<{ id: string; timezone: string }>>(
        updateResponse,
      )

    expect(updateResponse.status).toBe(200)
    expect(updatePayload.data).toMatchObject({
      id: createdPayload.data.id,
      timezone: 'Asia/Ho_Chi_Minh',
    })
  })

  it('rejects household update with invalid timezone', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-tz-invalid:tz-invalid@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family TZ' }),
      },
    )
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const updateResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ timezone: 'Not/A_Real_Timezone' }),
      },
    )
    const updatePayload = await parseJson<ApiErrorEnvelope>(updateResponse)

    expect(updateResponse.status).toBe(400)
    expect(updatePayload.error.code).toBe('INVALID_INPUT')
  })
})
