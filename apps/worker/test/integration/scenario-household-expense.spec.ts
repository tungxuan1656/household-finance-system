import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  authorizedJsonRequest,
  exchangeAccessToken,
  createHousehold,
  createExpense,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('household expense scenario', () => {
  it('covers a household expense lifecycle end to end', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-scenario-household-expense:scenario@example.com',
    )

    const householdResponse = await createHousehold(
      auth.accessToken,
      'Scenario Household',
    )

    expect(householdResponse.status).toBe(201)

    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

    const createResponse = await createExpense(auth.accessToken, {
      amount: 123000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'household',
      householdId,
      title: 'Scenario lunch',
      note: 'initial note',
      occurredAt: 1713744000000,
    })

    expect(createResponse.status).toBe(201)

    const created = await parseJson<
      ApiEnvelope<{
        id: string
        title: string
        note: string | null
        categoryKey: string
        sourceKey: string
        visibility: string
        householdId: string | null
      }>
    >(createResponse)

    expect(created.data.visibility).toBe('household')
    expect(created.data.householdId).toBe(householdId)
    expect(created.data.title).toBe('Scenario lunch')

    const listResponse = await authorizedJsonRequest(auth.accessToken, {
      method: 'GET',
      path: `/api/v1/expenses?household_id=${householdId}`,
    })

    expect(listResponse.status).toBe(200)

    const listPayload =
      await parseJson<ApiEnvelope<{ items: Array<{ id: string }> }>>(
        listResponse,
      )

    expect(listPayload.data.items.map((item) => item.id)).toContain(
      created.data.id,
    )

    const patchResponse = await authorizedJsonRequest(auth.accessToken, {
      method: 'PATCH',
      path: `/api/v1/expenses/${created.data.id}`,
      body: {
        amount: 156000,
        categoryKey: 'travel',
        sourceKey: 'bank-transfer',
        visibility: 'household',
        householdId,
        title: 'Scenario lunch updated',
        note: 'updated note',
        occurredAt: 1713744005000,
      },
    })

    expect(patchResponse.status).toBe(200)

    const patched = await parseJson<
      ApiEnvelope<{
        title: string
        note: string | null
        categoryKey: string
        sourceKey: string
        amountMinor: number
      }>
    >(patchResponse)

    expect(patched.data.title).toBe('Scenario lunch updated')
    expect(patched.data.note).toBe('updated note')
    expect(patched.data.categoryKey).toBe('travel')
    expect(patched.data.sourceKey).toBe('bank-transfer')
    expect(patched.data.amountMinor).toBe(156000)

    const deleteResponse = await authorizedJsonRequest(auth.accessToken, {
      method: 'DELETE',
      path: `/api/v1/expenses/${created.data.id}`,
    })

    expect(deleteResponse.status).toBe(200)

    const deletePayload =
      await parseJson<ApiEnvelope<{ deleted: boolean }>>(deleteResponse)

    expect(deletePayload.data.deleted).toBe(true)

    const householdRow = await env.DB.prepare(
      `SELECT id, name
         FROM households
        WHERE id = ?`,
    )
      .bind(householdId)
      .first<{ id: string; name: string }>()

    expect(householdRow).not.toBeNull()
    expect(householdRow?.name).toBe('Scenario Household')

    const expenseRow = await env.DB.prepare(
      `SELECT id, household_id, deleted_at
         FROM expenses
        WHERE id = ?`,
    )
      .bind(created.data.id)
      .first<{ id: string; household_id: string; deleted_at: number | null }>()

    expect(expenseRow).not.toBeNull()
    expect(expenseRow?.household_id).toBe(householdId)
    expect(expenseRow?.deleted_at).not.toBeNull()
  })
})
