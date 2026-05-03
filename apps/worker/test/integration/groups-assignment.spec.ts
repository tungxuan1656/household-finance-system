import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

const createHousehold = async (accessToken: string, name: string) => {
  const response = await SELF.fetch('https://example.com/api/v1/households', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })

  expect(response.status).toBe(201)

  const payload = await parseJson<ApiEnvelope<{ id: string }>>(response)

  return payload.data.id
}

const createExpenseGroup = async (
  accessToken: string,
  body: Record<string, unknown>,
) => {
  const response = await SELF.fetch('https://example.com/api/v1/groups', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  expect(response.status).toBe(201)

  return parseJson<ApiEnvelope<{ id: string }>>(response)
}

const createExpense = async (
  accessToken: string,
  body: Record<string, unknown>,
) => {
  const response = await SELF.fetch('https://example.com/api/v1/expenses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  expect(response.status).toBe(201)

  return parseJson<ApiEnvelope<{ id: string }>>(response)
}

describe('Worker integration: expense-to-group assignment', () => {
  it('replaces group assignments for an expense', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-assign:group-assign@example.com',
    )

    const householdId = await createHousehold(
      auth.accessToken,
      'Group Assignment Test',
    )

    const groupResponse = await createExpenseGroup(auth.accessToken, {
      householdId,
      name: 'Trip',
    })
    const groupId = groupResponse.data.id

    const expenseResponse = await createExpense(auth.accessToken, {
      householdId,
      title: 'Lunch',
      amount: 50000,
      categoryKey: 'food',
      sourceKey: 'cash',
      occurredAt: Date.now(),
      visibility: 'household',
    })
    const expenseId = expenseResponse.data.id

    const replaceResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${expenseId}/groups`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ groupIds: [groupId] }),
      },
    )

    expect(replaceResponse.status).toBe(200)
    const replacePayload =
      await parseJson<ApiEnvelope<{ id: string; groupIds: string[] }>>(
        replaceResponse,
      )

    expect(replacePayload.data.groupIds).toContain(groupId)
  })

  it('returns 401 when replacing group assignments unauthenticated', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/non-existent/groups',
      {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ groupIds: ['grp1'] }),
      },
    )

    expect(response.status).toBe(401)
  })

  it('returns 409 when assigning a group from a different household', async () => {
    const auth1 = await exchangeAccessToken(
      'test:firebase-user-group-assign-1:group-assign-1@example.com',
    )
    const auth2 = await exchangeAccessToken(
      'test:firebase-user-group-assign-2:group-assign-2@example.com',
    )

    const household1 = await createHousehold(auth1.accessToken, 'Household 1')
    const household2 = await createHousehold(auth2.accessToken, 'Household 2')

    const groupResponse = await createExpenseGroup(auth2.accessToken, {
      householdId: household2,
      name: 'Other Household Group',
    })
    const otherGroupId = groupResponse.data.id

    const expenseResponse = await createExpense(auth1.accessToken, {
      householdId: household1,
      title: 'Lunch',
      amount: 50000,
      categoryKey: 'food',
      sourceKey: 'cash',
      occurredAt: Date.now(),
      visibility: 'household',
    })
    const expenseId = expenseResponse.data.id

    const replaceResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses/${expenseId}/groups`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${auth1.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ groupIds: [otherGroupId] }),
      },
    )

    expect(replaceResponse.status).toBe(409)
    const errorPayload = await parseJson<ApiErrorEnvelope>(replaceResponse)
    expect(errorPayload.error.code).toBe('CONFLICT')
  })

  it('returns group summary with computed totals', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-summary:group-summary@example.com',
    )

    const householdId = await createHousehold(
      auth.accessToken,
      'Group Summary Test',
    )

    const groupResponse = await createExpenseGroup(auth.accessToken, {
      householdId,
      name: 'Vacation',
      eventBudget: 1000000,
    })
    const groupId = groupResponse.data.id

    const expenseResponse = await createExpense(auth.accessToken, {
      householdId,
      title: 'Hotel',
      amount: 300000,
      categoryKey: 'travel',
      sourceKey: 'card',
      occurredAt: Date.now(),
      visibility: 'household',
      groupIds: [groupId],
    })

    const summaryResponse = await SELF.fetch(
      `https://example.com/api/v1/groups/${groupId}/summary`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(summaryResponse.status).toBe(200)
    const summaryPayload = await parseJson<
      ApiEnvelope<{
        group: { id: string; name: string }
        totalSpendMinor: number
        expenseCount: number
        budgetRemainingMinor: number | null
        memberContributions: Array<{
          userId: string
          totalSpendMinor: number
          expenseCount: number
        }>
      }>
    >(summaryResponse)

    expect(summaryPayload.data.totalSpendMinor).toBe(300000)
    expect(summaryPayload.data.expenseCount).toBe(1)
    expect(summaryPayload.data.budgetRemainingMinor).toBe(700000)
    expect(summaryPayload.data.memberContributions.length).toBeGreaterThan(0)
    expect(summaryPayload.data.memberContributions[0].totalSpendMinor).toBe(
      300000,
    )
  })

  it('returns 404 for summary of non-existent group', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-group-summary-404:group-summary-404@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/groups/non-existent-id/summary',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(404)
  })
})
