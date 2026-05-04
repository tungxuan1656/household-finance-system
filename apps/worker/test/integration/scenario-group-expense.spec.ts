import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  authorizedJsonRequest,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('group expense scenario', () => {
  it('assigns a household expense to a group and reads back the summary', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-scenario-group-expense:scenario-group@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Scenario Group Household',
    )
    expect(householdResponse.status).toBe(201)

    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

    const groupResponse = await authorizedJsonRequest(auth.accessToken, {
      method: 'POST',
      path: '/api/v1/groups',
      body: {
        householdId,
        name: 'Scenario Trip Group',
        eventBudget: 1_000_000,
      },
    })

    expect(groupResponse.status).toBe(201)

    const groupPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(groupResponse)
    const groupId = groupPayload.data.id

    const expenseResponse = await createExpense(auth.accessToken, {
      amount: 275000,
      categoryKey: 'travel',
      sourceKey: 'card',
      visibility: 'household',
      householdId,
      title: 'Scenario hotel',
      note: 'before assignment',
      occurredAt: 1_700_000_000_000,
    })

    expect(expenseResponse.status).toBe(201)

    const expensePayload =
      await parseJson<ApiEnvelope<{ id: string; groupIds: string[] }>>(
        expenseResponse,
      )
    const expenseId = expensePayload.data.id

    const assignResponse = await authorizedJsonRequest(auth.accessToken, {
      method: 'PATCH',
      path: `/api/v1/expenses/${expenseId}/groups`,
      body: { groupIds: [groupId] },
    })

    expect(assignResponse.status).toBe(200)

    const assignPayload =
      await parseJson<ApiEnvelope<{ id: string; groupIds: string[] }>>(
        assignResponse,
      )

    expect(assignPayload.data.id).toBe(expenseId)
    expect(assignPayload.data.groupIds).toEqual([groupId])

    const summaryResponse = await authorizedJsonRequest(auth.accessToken, {
      method: 'GET',
      path: `/api/v1/groups/${groupId}/summary`,
    })

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

    expect(summaryPayload.data.group).toMatchObject({
      id: groupId,
      name: 'Scenario Trip Group',
    })
    expect(summaryPayload.data.totalSpendMinor).toBe(275000)
    expect(summaryPayload.data.expenseCount).toBe(1)
    expect(summaryPayload.data.budgetRemainingMinor).toBe(725000)
    expect(summaryPayload.data.memberContributions).toEqual([
      expect.objectContaining({
        userId: auth.user.id,
        totalSpendMinor: 275000,
        expenseCount: 1,
      }),
    ])

    const groupRow = await env.DB.prepare(
      `SELECT id, household_id, name
         FROM expense_groups
        WHERE id = ?`,
    )
      .bind(groupId)
      .first<{ id: string; household_id: string; name: string }>()

    expect(groupRow).not.toBeNull()
    expect(groupRow?.household_id).toBe(householdId)
    expect(groupRow?.name).toBe('Scenario Trip Group')

    const expenseGroupRow = await env.DB.prepare(
      `SELECT expense_id, group_id
         FROM expense_group_items
        WHERE expense_id = ? AND group_id = ?`,
    )
      .bind(expenseId, groupId)
      .first<{ expense_id: string; group_id: string }>()

    expect(expenseGroupRow).not.toBeNull()
    expect(expenseGroupRow?.expense_id).toBe(expenseId)
    expect(expenseGroupRow?.group_id).toBe(groupId)
  })
})
