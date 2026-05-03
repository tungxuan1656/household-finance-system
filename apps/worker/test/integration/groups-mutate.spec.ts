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

describe('Worker integration: expense groups mutation', () => {
  it('updates an expense group for an admin member', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-update:user-group-update@example.com',
    )

    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Group Update Test' }),
      },
    )
    expect(householdResponse.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

    // Create a group first
    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          householdId,
          name: 'Original Name',
        }),
      },
    )
    expect(createResponse.status).toBe(201)
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string; name: string }>>(createResponse)

    // Update the group
    const updateResponse = await SELF.fetch(
      `https://example.com/api/v1/groups/${createdPayload.data.id}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Name',
          description: 'Updated description',
        }),
      },
    )

    const updatePayload = await parseJson<
      ApiEnvelope<{
        id: string
        name: string
        description: string | null
      }>
    >(updateResponse)

    expect(updateResponse.status).toBe(200)
    expect(updatePayload.data).toMatchObject({
      id: createdPayload.data.id,
      name: 'Updated Name',
      description: 'Updated description',
    })
  })

  it('archives an expense group for an admin member', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-archive:user-group-archive@example.com',
    )

    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Group Archive Test' }),
      },
    )
    expect(householdResponse.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

    // Create a group first
    const createResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          householdId,
          name: 'Trip to Archive',
        }),
      },
    )
    expect(createResponse.status).toBe(201)
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createResponse)

    // Archive the group
    const archiveResponse = await SELF.fetch(
      `https://example.com/api/v1/groups/${createdPayload.data.id}/archive`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    const archivePayload =
      await parseJson<ApiEnvelope<{ archived: true }>>(archiveResponse)

    expect(archiveResponse.status).toBe(200)
    expect(archivePayload.data).toEqual({ archived: true })

    // Verify GET list no longer includes the archived group
    const listResponse = await SELF.fetch(
      `https://example.com/api/v1/groups?household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
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
  })
})
