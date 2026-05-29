import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('GET /api/v1/expenses - household feed', () => {
  it('returns household expenses when household_id is provided and user is a member', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-household:list-household@example.com',
    )

    const householdRes = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'List Test Household' }),
      },
    )
    expect(householdRes.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdRes)
    const householdId = householdPayload.data.id

    const createRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        categoryKey: 'food',
        sourceKey: 'cash',
        householdId,
        title: 'Shared dinner',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)

    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 20000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Personal snack',
        occurredAt: Date.now(),
      }),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses?household_id=${householdId}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{
          id: string
          title: string
          householdId: string | null
          currencyCode: string
        }>
        nextCursor: string | null
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Shared dinner')
    expect(payload.data.items[0].householdId).toBe(householdId)
    expect(payload.data.items[0].currencyCode).toBe('VND')
  })

  it('returns 403 when listing with household_id where user is not a member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-list-403-owner:list-403-owner@example.com',
    )
    const outsider = await exchangeAccessToken(
      'test:firebase-user-list-403-outsider:list-403-outsider@example.com',
    )

    const householdRes = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Private Household' }),
      },
    )
    expect(householdRes.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdRes)
    const householdId = householdPayload.data.id

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses?household_id=${householdId}`,
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

  it('returns paginated results in occurred_at desc then id desc order', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-pagination:list-pagination@example.com',
    )

    const occurredAt = Date.now() - 1000
    const titles = ['First inserted', 'Second inserted', 'Newest expense']
    const timestamps = [occurredAt, occurredAt, occurredAt + 1000]

    for (const [index, title] of titles.entries()) {
      const res = await SELF.fetch('https://example.com/api/v1/expenses', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50000 + index,
          categoryKey: 'food',
          sourceKey: 'cash',
          title,
          occurredAt: timestamps[index],
        }),
      })
      expect(res.status).toBe(201)
    }

    const firstPageResponse = await SELF.fetch(
      'https://example.com/api/v1/expenses?limit=2',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(firstPageResponse.status).toBe(200)

    const firstPage = await parseJson<
      ApiEnvelope<{
        items: Array<{ id: string; title: string; occurredAt: number }>
        nextCursor: string | null
      }>
    >(firstPageResponse)

    expect(firstPage.success).toBe(true)
    expect(firstPage.data.items).toHaveLength(2)
    expect(firstPage.data.items[0].title).toBe('Newest expense')
    expect(firstPage.data.items[0].occurredAt).toBe(occurredAt + 1000)
    expect(firstPage.data.items[1].occurredAt).toBe(occurredAt)
    expect(firstPage.data.nextCursor).not.toBeNull()

    const secondPageResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses?limit=2&cursor=${encodeURIComponent(firstPage.data.nextCursor ?? '')}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(secondPageResponse.status).toBe(200)

    const secondPage = await parseJson<
      ApiEnvelope<{
        items: Array<{ id: string; title: string; occurredAt: number }>
        nextCursor: string | null
      }>
    >(secondPageResponse)

    expect(secondPage.success).toBe(true)
    expect(secondPage.data.items).toHaveLength(1)
    expect(secondPage.data.items[0].occurredAt).toBe(occurredAt)
    expect(firstPage.data.items[1].id > secondPage.data.items[0].id).toBe(true)
    expect(secondPage.data.nextCursor).toBeNull()
  })

  it('keeps amount_desc pagination stable across pages', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-amount-sort:list-amount-sort@example.com',
    )

    const timestamps = [Date.now() - 3000, Date.now() - 2000, Date.now() - 1000]
    const amounts = [1000, 3000, 2000]
    const titles = ['Low', 'High', 'Middle']

    for (let index = 0; index < titles.length; index += 1) {
      const res = await SELF.fetch('https://example.com/api/v1/expenses', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: amounts[index],
          categoryKey: 'food',
          sourceKey: 'cash',
          title: titles[index],
          occurredAt: timestamps[index],
        }),
      })
      expect(res.status).toBe(201)
    }

    const firstPageResponse = await SELF.fetch(
      'https://example.com/api/v1/expenses?limit=2&sort=amount_desc',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(firstPageResponse.status).toBe(200)

    const firstPage = await parseJson<
      ApiEnvelope<{
        items: Array<{ id: string; title: string; amountMinor: number }>
        nextCursor: string | null
      }>
    >(firstPageResponse)

    expect(firstPage.success).toBe(true)
    expect(firstPage.data.items.map((item) => item.amountMinor)).toEqual([
      3000, 2000,
    ])
    expect(firstPage.data.nextCursor).not.toBeNull()

    const secondPageResponse = await SELF.fetch(
      `https://example.com/api/v1/expenses?limit=2&sort=amount_desc&cursor=${encodeURIComponent(firstPage.data.nextCursor ?? '')}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(secondPageResponse.status).toBe(200)

    const secondPage = await parseJson<
      ApiEnvelope<{
        items: Array<{ id: string; title: string; amountMinor: number }>
        nextCursor: string | null
      }>
    >(secondPageResponse)

    expect(secondPage.success).toBe(true)
    expect(secondPage.data.items).toHaveLength(1)
    expect(secondPage.data.items[0].amountMinor).toBe(1000)
    expect(secondPage.data.nextCursor).toBeNull()
  })

  it('returns 400 for invalid cursor', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-invalid-cursor:list-invalid-cursor@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses?cursor=not-base64',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })
})
