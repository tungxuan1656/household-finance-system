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

describe('Worker integration: expense groups reading', () => {
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
})
