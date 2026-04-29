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

describe('Worker integration: households CRUD and settings', () => {
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
      ApiEnvelope<{
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
      ApiEnvelope<{
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
    const createdPayload = await parseJson<
      ApiEnvelope<{
        id: string
      }>
    >(createResponse)

    const getResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      {
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const getPayload = await parseJson<
      ApiEnvelope<{
        id: string
        name: string
      }>
    >(getResponse)

    expect(getResponse.status).toBe(200)
    expect(getPayload.data).toMatchObject({
      id: createdPayload.data.id,
      name: 'Family Bravo',
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
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects household list when bearer token is missing', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/households')
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
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
      {
        headers: {
          authorization: `Bearer ${outsider.accessToken}`,
        },
      },
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
    const updatePayload = await parseJson<
      ApiEnvelope<{
        id: string
        name: string
        defaultCurrencyCode: string
      }>
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
      `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state
        )
        VALUES (?, ?, ?, ?, ?)`,
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
        body: JSON.stringify({
          name: 'Should Not Update',
        }),
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('archives a household for an admin and hides it from list/detail', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-archive-owner:archive-owner@example.com',
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
          name: 'Family Foxtrot',
          defaultCurrencyCode: 'usd',
        }),
      },
    )
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const archiveResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const archivePayload =
      await parseJson<ApiEnvelope<{ archived: true }>>(archiveResponse)

    expect(archiveResponse.status).toBe(200)
    expect(archivePayload.data).toEqual({ archived: true })

    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const listPayload =
      await parseJson<ApiEnvelope<{ items: Array<{ id: string }> }>>(
        listResponse,
      )

    expect(listResponse.status).toBe(200)
    expect(
      listPayload.data.items.find((item) => item.id === createdPayload.data.id),
    ).toBeUndefined()

    const detailResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      {
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const detailPayload = await parseJson<ApiErrorEnvelope>(detailResponse)

    expect(detailResponse.status).toBe(404)
    expect(detailPayload.error.code).toBe('NOT_FOUND')
  })

  it('returns forbidden when non-admin member archives household', async () => {
    await insertHouseholdFixture(env.DB)

    const member = await exchangeAccessToken(
      'test:firebase-user-household-member-archive:member-archive@example.com',
    )
    await env.DB.prepare(
      `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state
        )
        VALUES (?, ?, ?, ?, ?)`,
    )
      .bind('hm-member-archive', 'h1', member.user.id, 'member', 'active')
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/households/h1',
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('updates a household with timezone and defaultVisibility', async () => {
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
          defaultVisibility: 'household',
        }),
      },
    )
    const updatePayload = await parseJson<
      ApiEnvelope<{
        id: string
        timezone: string
        defaultVisibility: string
      }>
    >(updateResponse)

    expect(updateResponse.status).toBe(200)
    expect(updatePayload.data).toMatchObject({
      id: createdPayload.data.id,
      timezone: 'Asia/Ho_Chi_Minh',
      defaultVisibility: 'household',
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

  it('rejects household update with invalid defaultVisibility', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-vis-invalid:vis-invalid@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Visibility' }),
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
        body: JSON.stringify({ defaultVisibility: 'public' }),
      },
    )
    const updatePayload = await parseJson<ApiErrorEnvelope>(updateResponse)

    expect(updateResponse.status).toBe(400)
    expect(updatePayload.error.code).toBe('INVALID_INPUT')
  })

  it('blocks admin delete when other active members remain and returns 409', async () => {
    await insertHouseholdFixture(env.DB)

    const admin = await exchangeAccessToken(
      'test:firebase-user-household-delete-blocked:delete-blocked@example.com',
    )
    await env.DB.prepare(
      `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state
        )
        VALUES (?, ?, ?, ?, ?)`,
    )
      .bind('hm-delete-blocked', 'h1', admin.user.id, 'admin', 'active')
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/households/h1',
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${admin.accessToken}`,
        },
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(409)
    expect(payload.error.code).toBe('CONFLICT')
  })

  it('allows admin delete when they are the sole active member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-household-sole-delete:sole-delete@example.com',
    )

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Solo' }),
      },
    )
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    const deleteResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdPayload.data.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const deletePayload =
      await parseJson<ApiEnvelope<{ archived: boolean }>>(deleteResponse)

    expect(deleteResponse.status).toBe(200)
    expect(deletePayload.data).toEqual({ archived: true })
  })
})
