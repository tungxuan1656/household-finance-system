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

describe('GET /api/v1/expenses/:id - expense detail', () => {
  it('returns own private expense with full DTO', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-detail-own:detail-own@example.com',
    )

    // Create a private expense
    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 75000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'My private lunch',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created =
      await parseJson<ApiEnvelope<{ id: string; title: string }>>(createRes)
    const expenseId = created.data.id

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${expenseId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        id: string
        title: string
        amountMinor: number
        categoryKey: string
        sourceKey: string
        occurredAt: number
        visibility: string
        householdId: string | null
        payerUserId: string
        note: string | null
        createdByUserId: string
        createdAt: number
        updatedAt: number
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.id).toBe(expenseId)
    expect(payload.data.title).toBe('My private lunch')
    expect(payload.data.amountMinor).toBeGreaterThan(0)
    expect(payload.data.categoryKey).toBe('food')
    expect(payload.data.sourceKey).toBe('cash')
    expect(payload.data.visibility).toBe('private')
    expect(payload.data.householdId).toBeNull()
    expect(payload.data.payerUserId).toBe(auth.user.id)
    expect(payload.data.note).toBeNull()
    expect(payload.data.createdByUserId).toBe(auth.user.id)
    expect(typeof payload.data.occurredAt).toBe('number')
    expect(typeof payload.data.createdAt).toBe('number')
    expect(typeof payload.data.updatedAt).toBe('number')
  })

  it('returns household expense when user is a member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-detail-household-owner:detail-hh-owner@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-detail-household-member:detail-hh-member@example.com',
    )

    // Owner creates a household
    const householdRes = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Detail Test Household' }),
      },
    )
    expect(householdRes.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdRes)
    const householdId = householdPayload.data.id

    // Add member to the household
    const now = Date.now()
    await env.DB.prepare(
      `INSERT INTO household_memberships (
          id, household_id, user_id, role, state, joined_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        'hm-detail-household',
        householdId,
        member.user.id,
        'member',
        'active',
        now,
        now,
        now,
      )
      .run()

    // Owner creates a household expense
    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 120000,
        categoryKey: 'food',
        sourceKey: 'bank-transfer',
        visibility: 'household',
        householdId,
        title: 'Household grocery run',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)
    const expenseId = created.data.id

    // Member retrieves the household expense
    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${expenseId}`,
      {
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        id: string
        title: string
        visibility: string
        householdId: string
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.id).toBe(expenseId)
    expect(payload.data.title).toBe('Household grocery run')
    expect(payload.data.visibility).toBe('household')
    expect(payload.data.householdId).toBe(householdId)
  })

  it('returns 403 when accessing a private expense of another user', async () => {
    const userA = await exchangeAccessToken(
      'test:firebase-user-detail-private-a:detail-private-a@example.com',
    )
    const userB = await exchangeAccessToken(
      'test:firebase-user-detail-private-b:detail-private-b@example.com',
    )

    // User A creates a private expense
    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${userA.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 30000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: "User A's private expense",
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)
    const expenseId = created.data.id

    // User B tries to access it
    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${expenseId}`,
      {
        headers: {
          authorization: `Bearer ${userB.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(403)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('returns 403 when accessing a household expense without membership', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-detail-hh-403-owner:detail-hh-403-owner@example.com',
    )
    const outsider = await exchangeAccessToken(
      'test:firebase-user-detail-hh-403-outsider:detail-hh-403-outsider@example.com',
    )

    // Owner creates a household
    const householdRes = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Restricted Household' }),
      },
    )
    expect(householdRes.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdRes)
    const householdId = householdPayload.data.id

    // Owner creates a household expense
    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 80000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'household',
        householdId,
        title: 'Members-only expense',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)
    const expenseId = created.data.id

    // Outsider tries to access it
    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${expenseId}`,
      {
        headers: {
          authorization: `Bearer ${outsider.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(403)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 for a non-existent expense', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-detail-404:detail-404@example.com',
    )

    // Use a valid-looking but non-existent ULID
    const fakeId = '00000000000000000000000000'

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${fakeId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(404)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('returns 401 when accessing expense detail without authentication', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-detail-unauth-create:detail-unauth-create@example.com',
    )

    // Create an expense first so we have a valid ID to request
    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 10000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Unauth test expense',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      // No authorization header
    )

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })
})
