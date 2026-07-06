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

describe('POST /api/v1/incomes — integration tests', () => {
  it('Happy path: create personal income', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-create:inc-create@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 5000000,
        sourceKey: 'bank-transfer',
        title: 'Monthly salary',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(201)

    const payload = await parseJson<
      ApiEnvelope<{
        id: string
        title: string
        amountMinor: number
        currencyCode: string
        categoryKey: string
        sourceKey: string
        spentByUserId: string
        note: string | null
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.title).toBe('Monthly salary')
    expect(payload.data.amountMinor).toBe(5000000)
    expect(payload.data.currencyCode).toBe('VND')
    expect(payload.data.categoryKey).toBe('money-in')
    expect(payload.data.sourceKey).toBe('bank-transfer')
    expect(payload.data.spentByUserId).toBe(auth.user.id)
    expect(payload.data.note).toBeNull()
    expect(typeof payload.data.id).toBe('string')
  })

  it('accepts optional note', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-note:inc-note@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 2000000,
        sourceKey: 'bank-transfer',
        title: 'Freelance payment',
        occurredAt: Date.now(),
        note: 'Web dev project',
      }),
    })

    expect(response.status).toBe(201)

    const payload =
      await parseJson<ApiEnvelope<{ note: string | null }>>(response)

    expect(payload.data.note).toBe('Web dev project')
  })

  it('Error: unauthenticated -> 401', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        amount: 100000,
        sourceKey: 'cash',
        title: 'Test',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('Error: missing required fields -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-missing:inc-missing@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('Error: negative amount -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-neg:inc-neg@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: -100,
        sourceKey: 'cash',
        title: 'Test',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('Error: blank title -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-blank-title:inc-blank@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        sourceKey: 'cash',
        title: '   ',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)
  })

  it('Error: invalid sourceKey -> 400', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-bad-src:inc-bad-src@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        sourceKey: 'invalid-source',
        title: 'Test',
        occurredAt: Date.now(),
      }),
    })

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects extra fields via strict schema', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-extra:inc-extra@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100000,
        sourceKey: 'cash',
        title: 'Test',
        occurredAt: Date.now(),
        categoryKey: 'transport', // should be rejected — server sets it
      }),
    })

    expect(response.status).toBe(400)
  })
})

describe('GET /api/v1/incomes — integration tests', () => {
  it('returns empty list when user has no incomes', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-list-empty:inc-list-empty@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      headers: { authorization: `Bearer ${auth.accessToken}` },
    })

    expect(response.status).toBe(200)

    const payload =
      await parseJson<
        ApiEnvelope<{ items: unknown[]; nextCursor: string | null }>
      >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(0)
    expect(payload.data.nextCursor).toBeNull()
  })

  it('returns personal incomes, newest first, VND default', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-list-items:inc-list-items@example.com',
    )

    // Create incomes in reverse chronological order
    for (const [title, amount] of [
      ['Salary June', 10000000],
      ['Freelance June', 3000000],
    ]) {
      const res = await SELF.fetch('https://example.com/api/v1/incomes', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          sourceKey: 'bank-transfer',
          title,
          occurredAt: Date.now(),
        }),
      })
      expect(res.status).toBe(201)
    }

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      headers: { authorization: `Bearer ${auth.accessToken}` },
    })

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{
          title: string
          amountMinor: number
          currencyCode: string
          categoryKey: string
          sourceKey: string
          spentByUserId: string
        }>
        nextCursor: string | null
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(2)
    // Newest first
    expect(payload.data.items[0].title).toBe('Freelance June')
    expect(payload.data.items[1].title).toBe('Salary June')
    expect(payload.data.items.every((i) => i.currencyCode === 'VND')).toBe(true)
    expect(payload.data.items.every((i) => i.categoryKey === 'money-in')).toBe(
      true,
    )
    expect(
      payload.data.items.every((i) => i.sourceKey === 'bank-transfer'),
    ).toBe(true)
    expect(
      payload.data.items.every((i) => i.spentByUserId === auth.user.id),
    ).toBe(true)
    expect(payload.data.nextCursor).toBeNull()
  })

  it('filters by date range', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-date:inc-date@example.com',
    )

    const now = Date.now()
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000

    await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 5000000,
        sourceKey: 'cash',
        title: 'Old income',
        occurredAt: twoWeeksAgo,
      }),
    })

    await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 8000000,
        sourceKey: 'bank-transfer',
        title: 'Recent income',
        occurredAt: now,
      }),
    })

    const midPoint = twoWeeksAgo + (now - twoWeeksAgo) / 2

    const response = await SELF.fetch(
      `https://example.com/api/v1/incomes?date_from=${midPoint}`,
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<{ items: Array<{ title: string }> }>>(
        response,
      )

    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Recent income')
  })

  it('filters by source_key', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-src-filter:inc-src-filter@example.com',
    )

    await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 3000000,
        sourceKey: 'cash',
        title: 'Cash income',
        occurredAt: Date.now(),
      }),
    })

    await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 5000000,
        sourceKey: 'bank-transfer',
        title: 'Bank income',
        occurredAt: Date.now(),
      }),
    })

    const response = await SELF.fetch(
      `https://example.com/api/v1/incomes?source_key=cash`,
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string; sourceKey: string }>
      }>
    >(response)

    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Cash income')
    expect(payload.data.items[0].sourceKey).toBe('cash')
  })

  it('excludes soft-deleted incomes from list results', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-deleted:inc-deleted@example.com',
    )

    const createdResponse = await SELF.fetch(
      'https://example.com/api/v1/incomes',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1500000,
          sourceKey: 'cash',
          title: 'Deleted income',
          occurredAt: Date.now(),
        }),
      },
    )

    expect(createdResponse.status).toBe(201)

    const createdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(createdResponse)

    await env.DB.prepare('UPDATE incomes SET deleted_at = ? WHERE id = ?')
      .bind(Date.now(), createdPayload.data.id)
      .run()

    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      headers: { authorization: `Bearer ${auth.accessToken}` },
    })

    expect(response.status).toBe(200)

    const payload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ id: string }>; nextCursor: string | null }>
      >(response)

    expect(payload.data.items).toHaveLength(0)
  })

  it('paginates with cursor, newest-first stable order', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-inc-cursor:inc-cursor@example.com',
    )

    // Create 5 incomes
    for (let i = 0; i < 5; i++) {
      const res = await SELF.fetch('https://example.com/api/v1/incomes', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100000 * (i + 1),
          sourceKey: 'cash',
          title: `Income ${i + 1}`,
          occurredAt: Date.now(),
        }),
      })
      expect(res.status).toBe(201)
    }

    // Fetch with limit=2
    const page1Response = await SELF.fetch(
      'https://example.com/api/v1/incomes?limit=2',
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )

    expect(page1Response.status).toBe(200)

    const page1 = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string }>
        nextCursor: string | null
      }>
    >(page1Response)

    expect(page1.data.items).toHaveLength(2)
    expect(page1.data.nextCursor).not.toBeNull()

    // Follow cursor for page 2
    const page2Response = await SELF.fetch(
      `https://example.com/api/v1/incomes?limit=2&cursor=${page1.data.nextCursor}`,
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )

    expect(page2Response.status).toBe(200)

    const page2 = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string }>
        nextCursor: string | null
      }>
    >(page2Response)

    expect(page2.data.items).toHaveLength(2)
    expect(page2.data.nextCursor).not.toBeNull()

    // Page 3 — last item
    const page3Response = await SELF.fetch(
      `https://example.com/api/v1/incomes?limit=2&cursor=${page2.data.nextCursor}`,
      { headers: { authorization: `Bearer ${auth.accessToken}` } },
    )

    expect(page3Response.status).toBe(200)

    const page3 = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string }>
        nextCursor: string | null
      }>
    >(page3Response)

    expect(page3.data.items).toHaveLength(1)
    expect(page3.data.nextCursor).toBeNull()

    // Verify titles across all pages
    const allTitles = [
      ...page1.data.items,
      ...page2.data.items,
      ...page3.data.items,
    ].map((i) => i.title)
    // Should be newest first
    expect(allTitles).toEqual([
      'Income 5',
      'Income 4',
      'Income 3',
      'Income 2',
      'Income 1',
    ])
  })

  it('Error: unauthenticated -> 401', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      headers: { 'content-type': 'application/json' },
    })

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('does not mix incomes between users', async () => {
    const authA = await exchangeAccessToken(
      'test:firebase-user-inc-scope-a:inc-scope-a@example.com',
    )
    const authB = await exchangeAccessToken(
      'test:firebase-user-inc-scope-b:inc-scope-b@example.com',
    )

    // Create income for user A
    await SELF.fetch('https://example.com/api/v1/incomes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${authA.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1000000,
        sourceKey: 'cash',
        title: 'A income',
        occurredAt: Date.now(),
      }),
    })

    // User B should not see A's incomes
    const response = await SELF.fetch('https://example.com/api/v1/incomes', {
      headers: { authorization: `Bearer ${authB.accessToken}` },
    })

    const payload = await parseJson<ApiEnvelope<{ items: unknown[] }>>(response)

    expect(payload.data.items).toHaveLength(0)
  })
})
