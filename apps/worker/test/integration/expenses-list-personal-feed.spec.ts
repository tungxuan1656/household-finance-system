import { describe, expect, it } from 'vitest'

import {
  SELF,
  type ApiEnvelope,
  exchangeAccessToken,
  parseJson,
} from './expenses-list-personal.test-setup'

describe('GET /api/v1/expenses personal feed', () => {
  it('returns personal expenses when no household_id is provided', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-personal:list-personal@example.com',
    )

    for (const title of ['Groceries', 'Transport']) {
      const res = await SELF.fetch('https://example.com/api/v1/expenses', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50000,
          categoryKey: 'food',
          sourceKey: 'cash',
          visibility: 'private',
          title,
          occurredAt: Date.now(),
        }),
      })
      expect(res.status).toBe(201)
    }

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      headers: { authorization: `Bearer ${auth.accessToken}` },
    })
    expect(response.status).toBe(200)

    const payload =
      await parseJson<
        ApiEnvelope<{
          items: Array<{
            id: string
            title: string
            visibility: string
            currencyCode: string
          }>
          nextCursor: string | null
        }>
      >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(2)
    expect(payload.data.items.map((i) => i.title).sort()).toEqual([
      'Groceries',
      'Transport',
    ])
    expect(payload.data.items.every((i) => i.visibility === 'private')).toBe(
      true,
    )
    expect(payload.data.items.every((i) => i.currencyCode === 'VND')).toBe(true)
    expect(payload.data.nextCursor).toBeNull()
  })

  it('filters expenses by date_from', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-datefrom:list-datefrom@example.com',
    )
    const now = Date.now()
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 30000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Old expense',
        occurredAt: oneWeekAgo,
      }),
    })
    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 40000,
        categoryKey: 'transport',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Recent expense',
        occurredAt: now,
      }),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses?date_from=${oneWeekAgo + (now - oneWeekAgo) / 2}`,
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )
    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<{ items: Array<{ title: string }> }>>(
        response,
      )
    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Recent expense')
  })

  it('filters expenses by category_key', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-category:list-category@example.com',
    )

    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Lunch',
        occurredAt: Date.now(),
      }),
    })
    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 20000,
        categoryKey: 'transport',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Bus fare',
        occurredAt: Date.now(),
      }),
    })

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses?category_key=food',
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )
    expect(response.status).toBe(200)

    const payload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ title: string; categoryKey: string }> }>
      >(response)
    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Lunch')
    expect(payload.data.items[0].categoryKey).toBe('food')
  })

  it('filters expenses by note substring, amount range, creator_id, and sort', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-new-filters:list-new-filters@example.com',
    )

    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 15000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Match note',
        note: 'shared groceries receipt',
        occurredAt: Date.now() - 1000,
      }),
    })
    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 25000,
        categoryKey: 'transport',
        sourceKey: 'cash',
        visibility: 'private',
        title: 'Wrong note',
        note: 'commute receipt',
        occurredAt: Date.now(),
      }),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses?query=groceries&amount_min=10000&amount_max=20000&creator_id=${auth.user.id}&sort=amount_desc`,
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )
    expect(response.status).toBe(200)

    const payload =
      await parseJson<
        ApiEnvelope<{
          items: Array<{
            title: string
            note: string | null
            amountMinor: number
            createdByUserId: string
          }>
        }>
      >(response)
    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Match note')
    expect(payload.data.items[0].note).toBe('shared groceries receipt')
    expect(payload.data.items[0].amountMinor).toBe(15000)
    expect(payload.data.items[0].createdByUserId).toBe(auth.user.id)
  })
})
