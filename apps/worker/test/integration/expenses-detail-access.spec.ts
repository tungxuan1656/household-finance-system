import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  env,
  exchangeAccessToken,
  parseJson,
  SELF,
} from './expenses-detail.test-setup'

describe('GET /api/v1/expenses/:id - expense detail access', () => {
  it('returns 200 when the spender is no longer an active household member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-detail-former-owner:detail-former-owner@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-detail-former-member:detail-former-member@example.com',
    )

    const householdRes = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Former member household' }),
      },
    )
    expect(householdRes.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdRes)
    const householdId = householdPayload.data.id

    const now = Date.now()
    await env.DB.prepare(
      `INSERT INTO household_memberships (
          id, household_id, user_id, role, state, joined_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        'hm-detail-former-member',
        householdId,
        member.user.id,
        'member',
        'active',
        now,
        now,
        now,
      )
      .run()

    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 98000,
        categoryKey: 'food',
        sourceKey: 'cash',
        householdId,
        title: 'Former creator expense',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)

    await env.DB.prepare(
      `UPDATE household_memberships
          SET state = 'left',
              updated_at = ?
        WHERE household_id = ?
          AND user_id = ?`,
    )
      .bind(Date.now(), householdId, owner.user.id)
      .run()

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
      {
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<
        ApiEnvelope<{
          id: string
          householdId: string | null
          spentByUserId: string
        }>
      >(response)
    expect(payload.data.id).toBe(created.data.id)
    expect(payload.data.householdId).toBe(householdId)
    expect(payload.data.spentByUserId).toBe(owner.user.id)
  })

  it('returns 403 when accessing a private expense of another user', async () => {
    const userA = await exchangeAccessToken(
      'test:firebase-user-detail-private-a:detail-private-a@example.com',
    )
    const userB = await exchangeAccessToken(
      'test:firebase-user-detail-private-b:detail-private-b@example.com',
    )

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
        title: "User A's private expense",
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)
    const expenseId = created.data.id

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
        householdId,
        title: 'Members-only expense',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)
    const expenseId = created.data.id

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

  it('returns 404 for a soft-deleted expense', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-detail-soft-delete:detail-soft-delete@example.com',
    )

    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 42000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Soft deleted expense',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)

    await env.DB.prepare(
      `UPDATE expenses
          SET deleted_at = ?,
              updated_at = ?
        WHERE id = ?`,
    )
      .bind(Date.now(), Date.now(), created.data.id)
      .run()

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
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
        title: 'Unauth test expense',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)
    const created = await parseJson<ApiEnvelope<{ id: string }>>(createRes)

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses/${created.data.id}`,
    )

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })
})
