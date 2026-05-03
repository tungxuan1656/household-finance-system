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

describe('Worker integration: expense groups CRUD', () => {
  it('creates an expense group for an admin member', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-create:user-group-create@example.com',
    )

    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Group Create Test' }),
      },
    )
    expect(householdResponse.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

    const startDate = 1717200000000
    const endDate = 1719792000000
    const eventBudget = 5000000

    const response = await SELF.fetch('https://example.com/api/v1/groups', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        householdId,
        name: 'Summer Vacation',
        description: 'Family trip to the beach',
        startDate,
        endDate,
        eventBudget,
      }),
    })

    const payload = await parseJson<
      ApiEnvelope<{
        id: string
        name: string
        description: string | null
        status: string
        startDate: number | null
        endDate: number | null
        eventBudgetMinor: number | null
        totalSpendMinor: number
        householdId: string
        createdByUserId: string
        createdAt: number
        updatedAt: number
      }>
    >(response)

    expect(response.status).toBe(201)
    expect(payload.data).toMatchObject({
      name: 'Summer Vacation',
      description: 'Family trip to the beach',
      status: 'active',
      startDate,
      endDate,
      eventBudgetMinor: eventBudget,
      totalSpendMinor: 0,
      householdId,
      createdByUserId: auth.user.id,
    })
    expect(typeof payload.data.id).toBe('string')
    expect(typeof payload.data.createdAt).toBe('number')
    expect(typeof payload.data.updatedAt).toBe('number')
  })

  it('lists expense groups for a household member', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-list:user-group-list@example.com',
    )

    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Group List Test' }),
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
          name: 'Weekend Trip',
        }),
      },
    )
    expect(createResponse.status).toBe(201)
    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string; name: string }>>(createResponse)

    // List groups
    const listResponse = await SELF.fetch(
      `https://example.com/api/v1/groups?household_id=${householdId}`,
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
          status: string
        }>
      }>
    >(listResponse)

    expect(listResponse.status).toBe(200)
    expect(listPayload.data.items).toHaveLength(1)
    expect(listPayload.data.items[0]).toMatchObject({
      id: createdPayload.data.id,
      name: 'Weekend Trip',
      status: 'active',
    })
  })

  it('returns one expense group by id for a household member', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-get:user-group-get@example.com',
    )

    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Group Get Test' }),
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
          name: 'Road Trip',
          description: 'Cross-country adventure',
        }),
      },
    )
    expect(createResponse.status).toBe(201)
    const createdPayload =
      await parseJson<
        ApiEnvelope<{ id: string; name: string; description: string | null }>
      >(createResponse)

    // Get group by id
    const getResponse = await SELF.fetch(
      `https://example.com/api/v1/groups/${createdPayload.data.id}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    const getPayload = await parseJson<
      ApiEnvelope<{
        id: string
        name: string
        description: string | null
        status: string
        householdId: string
      }>
    >(getResponse)

    expect(getResponse.status).toBe(200)
    expect(getPayload.data).toMatchObject({
      id: createdPayload.data.id,
      name: 'Road Trip',
      description: 'Cross-country adventure',
      status: 'active',
      householdId,
    })
  })

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

  it('rejects group create when request body is invalid', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-invalid:user-group-invalid@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/groups', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        householdId: 'some-household-id',
        name: '   ',
      }),
    })

    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

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

  it('computes non-zero totalSpendMinor from linked expenses', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-spend:user-group-spend@example.com',
    )

    // Create household
    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Group Spend Test' }),
      },
    )
    expect(householdResponse.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

    // Create group
    const groupResponse = await SELF.fetch(
      'https://example.com/api/v1/groups',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          householdId,
          name: 'Trip Budget',
          eventBudget: 10000000,
        }),
      },
    )
    expect(groupResponse.status).toBe(201)
    const groupPayload = await parseJson<
      ApiEnvelope<{
        id: string
        householdId: string
      }>
    >(groupResponse)
    const groupId = groupPayload.data.id

    // Create two expenses
    const expense1Response = await SELF.fetch(
      'https://example.com/api/v1/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 2500000,
          categoryKey: 'food',
          sourceKey: 'cash',
          visibility: 'household',
          householdId,
          title: 'Dinner',
          occurredAt: Date.now(),
        }),
      },
    )
    expect(expense1Response.status).toBe(201)
    const expense1Payload =
      await parseJson<ApiEnvelope<{ id: string }>>(expense1Response)

    const expense2Response = await SELF.fetch(
      'https://example.com/api/v1/expenses',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1500000,
          categoryKey: 'transport',
          sourceKey: 'card',
          visibility: 'household',
          householdId,
          title: 'Taxi',
          occurredAt: Date.now(),
        }),
      },
    )
    expect(expense2Response.status).toBe(201)
    const expense2Payload =
      await parseJson<ApiEnvelope<{ id: string }>>(expense2Response)

    // Link expenses to group via DB
    await env.DB.prepare(
      `INSERT INTO expense_group_items (id, household_id, expense_id, group_id, assigned_by_user_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        'egi1',
        householdId,
        expense1Payload.data.id,
        groupId,
        auth.user.id,
        Date.now(),
        'egi2',
        householdId,
        expense2Payload.data.id,
        groupId,
        auth.user.id,
        Date.now(),
      )
      .run()

    // List should show totalSpendMinor = 4000000
    const listResponse = await SELF.fetch(
      `https://example.com/api/v1/groups?household_id=${householdId}`,
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
          totalSpendMinor: number
          eventBudgetMinor: number | null
        }>
      }>
    >(listResponse)
    expect(listResponse.status).toBe(200)
    expect(listPayload.data.items).toHaveLength(1)
    expect(listPayload.data.items[0].totalSpendMinor).toBe(4000000)
    expect(listPayload.data.items[0].eventBudgetMinor).toBe(10000000)

    // Get detail should also show totalSpendMinor = 4000000
    const getResponse = await SELF.fetch(
      `https://example.com/api/v1/groups/${groupId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )
    const getPayload = await parseJson<
      ApiEnvelope<{
        id: string
        totalSpendMinor: number
      }>
    >(getResponse)
    expect(getResponse.status).toBe(200)
    expect(getPayload.data.totalSpendMinor).toBe(4000000)
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
