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

describe('Worker integration: households delete', () => {
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
        headers: { authorization: `Bearer ${owner.accessToken}` },
      },
    )
    const archivePayload =
      await parseJson<ApiEnvelope<{ archived: true }>>(archiveResponse)

    expect(archiveResponse.status).toBe(200)
    expect(archivePayload.data).toEqual({ archived: true })

    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        headers: { authorization: `Bearer ${owner.accessToken}` },
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
      { headers: { authorization: `Bearer ${owner.accessToken}` } },
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
      `INSERT INTO household_memberships (id, household_id, user_id, role, state) VALUES (?, ?, ?, ?, ?)`,
    )
      .bind('hm-member-archive', 'h1', member.user.id, 'member', 'active')
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/households/h1',
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${member.accessToken}` },
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('blocks admin delete when other active members remain and returns 409', async () => {
    await insertHouseholdFixture(env.DB)

    const admin = await exchangeAccessToken(
      'test:firebase-user-household-delete-blocked:delete-blocked@example.com',
    )
    await env.DB.prepare(
      `INSERT INTO household_memberships (id, household_id, user_id, role, state) VALUES (?, ?, ?, ?, ?)`,
    )
      .bind('hm-delete-blocked', 'h1', admin.user.id, 'admin', 'active')
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/households/h1',
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${admin.accessToken}` },
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
        headers: { authorization: `Bearer ${owner.accessToken}` },
      },
    )
    const deletePayload =
      await parseJson<ApiEnvelope<{ archived: boolean }>>(deleteResponse)

    expect(deleteResponse.status).toBe(200)
    expect(deletePayload.data).toEqual({ archived: true })
  })
})
