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

describe('Worker integration: expense groups authorization', () => {
  it('returns not found when caller accesses a group in a household they do not belong to', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-group-owner:group-owner@example.com',
    )
    const outsider = await exchangeAccessToken(
      'test:firebase-user-group-outsider:group-outsider@example.com',
    )

    // Owner creates a household and a group
    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Outsider Test' }),
      },
    )
    expect(householdResponse.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          householdId,
          name: 'Secret Group',
        }),
      },
    )
    expect(createResponse.status).toBe(201)
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    // Outsider tries to get the group
    const response = await SELF.fetch(
      `https://example.com/api/v1/groups/${createdPayload.data.id}`,
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

  it('returns forbidden when non-admin member creates/updates/archives group', async () => {
    await insertHouseholdFixture(env.DB)

    const member = await exchangeAccessToken(
      'test:firebase-user-group-member:group-member@example.com',
    )

    // Add member to household h1 with role 'member'
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
      .bind('hm-group-member', 'h1', member.user.id, 'member', 'active')
      .run()

    // 1. Create group as member — forbidden
    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          householdId: 'h1',
          name: 'Should Not Create',
        }),
      },
    )
    const createPayload = await parseJson<ApiErrorEnvelope>(createResponse)
    expect(createResponse.status).toBe(403)
    expect(createPayload.error.code).toBe('FORBIDDEN')

    // 2. Update group (grp1 from fixture) as member — forbidden
    const updateResponse = await SELF.fetch(
      'https://example.com/api/v1/groups/grp1',
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
    const updatePayload = await parseJson<ApiErrorEnvelope>(updateResponse)
    expect(updateResponse.status).toBe(403)
    expect(updatePayload.error.code).toBe('FORBIDDEN')

    // 3. Archive group (grp1 from fixture) as member — forbidden
    const archiveResponse = await SELF.fetch(
      'https://example.com/api/v1/groups/grp1/archive',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )
    const archivePayload = await parseJson<ApiErrorEnvelope>(archiveResponse)
    expect(archiveResponse.status).toBe(403)
    expect(archivePayload.error.code).toBe('FORBIDDEN')
  })

  it('returns 401 for unauthenticated requests', async () => {
    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ householdId: 'h1', name: 'No Auth' }),
      },
    )
    expect(createResponse.status).toBe(401)

    const listResponse = await SELF.fetch(
      'https://example.com/api/v1/groups?household_id=h1',
    )
    expect(listResponse.status).toBe(401)

    const getResponse = await SELF.fetch(
      'https://example.com/api/v1/groups/grp1',
    )
    expect(getResponse.status).toBe(401)

    const updateResponse = await SELF.fetch(
      'https://example.com/api/v1/groups/grp1',
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'No Auth' }),
      },
    )
    expect(updateResponse.status).toBe(401)

    const archiveResponse = await SELF.fetch(
      'https://example.com/api/v1/groups/grp1/archive',
      { method: 'POST' },
    )
    expect(archiveResponse.status).toBe(401)
  })
})
