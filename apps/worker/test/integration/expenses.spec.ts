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

describe('POST /api/v1/expenses - integration tests', () => {
  it('Happy path: create private expense', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-private:user-private@example.com',
    )

    const dto = {
      amount: 100000,
      categoryKey: 'food',
      sourceKey: 'cash',
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    expect(response.status).toBe(201)

    const payload = await parseJson<
      ApiEnvelope<{
        id: string
        title: string
        categoryKey: string
        sourceKey: string
        householdId: string | null
        spentByUserId: string
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.householdId).toBeNull()
    expect(payload.data.spentByUserId).toBe(auth.user.id)
    expect(payload.data.categoryKey).toBe('food')
    expect(payload.data.sourceKey).toBe('cash')
  })

  it('accepts momo as a valid expense source key and persists it', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-momo:user-momo@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        categoryKey: 'food',
        sourceKey: 'momo',
        title: 'Momo expense',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(201)

    const payload =
      await parseJson<ApiEnvelope<{ sourceKey: string }>>(response)
    expect(payload.data.sourceKey).toBe('momo')
  })

  it('rejects removed e-wallet as a source key', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-ewallet:user-ewallet@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        categoryKey: 'food',
        sourceKey: 'e-wallet',
        title: 'Old source expense',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)
  })

  it('Happy path: create household expense with valid membership', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-household:user-household-expense@example.com',
    )

    // Create a household first
    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test Household' }),
      },
    )
    expect(householdResponse.status).toBe(201)

    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string; name: string }>>(
        householdResponse,
      )
    const householdId = householdPayload.data.id

    const dto = {
      amount: 50000,
      categoryKey: 'food',
      sourceKey: 'bank-transfer',
      householdId,
      title: 'Test household expense',
      occurredAt: Date.now(),
    }

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    expect(response.status).toBe(201)

    const payload =
      await parseJson<ApiEnvelope<{ householdId: string }>>(response)

    expect(payload.success).toBe(true)
    expect(payload.data.householdId).toBe(householdId)
  })

  it('Error: blank householdId -> 400 INVALID_INPUT', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-no-household:user-no-household@example.com',
    )

    const dto = {
      amount: 1000,
      categoryKey: 'food',
      sourceKey: 'cash',
      householdId: '   ',
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('Error: household expense without membership -> 403 FORBIDDEN', async () => {
    // Create a household with one user, then try to create an expense
    // as a different user who is not a member
    const ownerAuth = await exchangeAccessToken(
      'test:firebase-user-expense-owner:owner@example.com',
    )
    const otherAuth = await exchangeAccessToken(
      'test:firebase-user-expense-other:other@example.com',
    )

    // Owner creates a household
    const householdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${ownerAuth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Owner Household' }),
      },
    )
    expect(householdResponse.status).toBe(201)

    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdResponse)
    const householdId = householdPayload.data.id

    const dto = {
      amount: 800,
      categoryKey: 'food',
      sourceKey: 'cash',
      householdId,
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    // Other user tries to create expense in owner's household
    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${otherAuth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    expect(response.status).toBe(403)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('Error: create with non-expense category key (money-in) -> 400 INVALID_INPUT', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-category:user-category@example.com',
    )

    const dto = {
      amount: 100,
      categoryKey: 'money-in',
      sourceKey: 'cash',
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    expect(response.status).toBe(400)
  })

  it('Error: invalid source key -> 400 INVALID_INPUT', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-source:user-source@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        categoryKey: 'food',
        sourceKey: 'not-a-key',
        title: 'Test expense',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)
  })

  it('Error: unauthenticated -> 401 UNAUTHENTICATED', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Test expense',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(401)
  })

  it('Error: negative amount -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-amount:user-amount@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: -50,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Test expense',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('Error: missing required fields -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-expense-missing:user-missing@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
  })
})
