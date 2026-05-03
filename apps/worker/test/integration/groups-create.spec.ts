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

describe('Worker integration: expense groups creation', () => {
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
})
