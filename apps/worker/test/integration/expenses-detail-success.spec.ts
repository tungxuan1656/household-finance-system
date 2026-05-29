import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  env,
  exchangeAccessToken,
  parseJson,
  SELF,
} from './expenses-detail.test-setup'

describe('GET /api/v1/expenses/:id - expense detail success', () => {
  it('returns own private expense with full DTO', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-detail-own:detail-own@example.com',
    )

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
        currencyCode: string
        categoryKey: string
        sourceKey: string
        occurredAt: number
        householdId: string | null
        spentByUserId: string
        note: string | null
        createdAt: number
        updatedAt: number
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.id).toBe(expenseId)
    expect(payload.data.title).toBe('My private lunch')
    expect(payload.data.amountMinor).toBeGreaterThan(0)
    expect(payload.data.currencyCode).toBe('VND')
    expect(payload.data.categoryKey).toBe('food')
    expect(payload.data.sourceKey).toBe('cash')
    expect(payload.data.householdId).toBeNull()
    expect(payload.data.spentByUserId).toBe(auth.user.id)
    expect(payload.data.note).toBeNull()
    expect(typeof payload.data.occurredAt).toBe('number')
    expect(typeof payload.data.createdAt).toBe('number')
    expect(typeof payload.data.updatedAt).toBe('number')
  })

  it('returns household expense when user is a member with household currency and correct minor units', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-detail-household-owner:detail-hh-owner@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-detail-household-member:detail-hh-member@example.com',
    )

    const householdRes = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Detail Test Household',
          defaultCurrencyCode: 'BHD',
        }),
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

    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1.234,
        categoryKey: 'food',
        sourceKey: 'bank-transfer',
        householdId,
        title: 'Household grocery run',
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
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        id: string
        title: string
        amountMinor: number
        currencyCode: string
        householdId: string
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.id).toBe(expenseId)
    expect(payload.data.title).toBe('Household grocery run')
    expect(payload.data.amountMinor).toBe(1234)
    expect(payload.data.currencyCode).toBe('BHD')
    expect(payload.data.householdId).toBe(householdId)
  })
})
