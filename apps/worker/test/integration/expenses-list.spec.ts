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

describe('GET /api/v1/expenses - list expenses', () => {
  it('returns personal expenses when no household_id is provided', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-personal:list-personal@example.com',
    )

    // Create two private expenses
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
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
      },
    })

    expect(response.status).toBe(200)

    const payload = await parseJson<
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
    // nextCursor is null when fewer items than the page limit
    expect(payload.data.nextCursor).toBeNull()
  })

  it('returns household expenses when household_id is provided and user is a member', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-household:list-household@example.com',
    )

    // Create a household
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

    // Create a household expense
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
        visibility: 'household',
        householdId,
        title: 'Shared dinner',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)

    // Also create a private expense (should not appear in household feed)
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
        visibility: 'private',
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
          visibility: string
          currencyCode: string
        }>
        nextCursor: string | null
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Shared dinner')
    expect(payload.data.items[0].householdId).toBe(householdId)
    expect(payload.data.items[0].visibility).toBe('household')
    expect(payload.data.items[0].currencyCode).toBe('VND')
  })

  it('returns 403 when listing with household_id where user is not a member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-list-403-owner:list-403-owner@example.com',
    )
    const outsider = await exchangeAccessToken(
      'test:firebase-user-list-403-outsider:list-403-outsider@example.com',
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
        body: JSON.stringify({ name: 'Private Household' }),
      },
    )
    expect(householdRes.status).toBe(201)
    const householdPayload =
      await parseJson<ApiEnvelope<{ id: string }>>(householdRes)
    const householdId = householdPayload.data.id

    // Outsider lists expenses with that household_id
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

  it('returns 400 for an invalid cursor', async () => {
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
          visibility: 'private',
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
        items: Array<{
          id: string
          title: string
          occurredAt: number
        }>
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
        items: Array<{
          id: string
          title: string
          occurredAt: number
        }>
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
          visibility: 'private',
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

  it('does not return household expenses in the personal feed after the creator leaves the household', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-list-former-owner:list-former-owner@example.com',
    )
    const member = await exchangeAccessToken(
      'test:firebase-user-list-former-member:list-former-member@example.com',
    )

    const householdRes = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Former member list household' }),
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
        'hm-list-former-member',
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
        visibility: 'household',
        householdId,
        title: 'Former member shared expense',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes.status).toBe(201)

    await env.DB.prepare(
      `UPDATE household_memberships
          SET state = 'left',
              updated_at = ?
        WHERE household_id = ?
          AND user_id = ?`,
    )
      .bind(Date.now(), householdId, owner.user.id)
      .run()

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
      },
    })

    expect(response.status).toBe(200)

    const payload = await parseJson<
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
    expect(payload.data.items).toHaveLength(0)
    expect(payload.data.nextCursor).toBeNull()
  })

  it('filters expenses by date_from', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-datefrom:list-datefrom@example.com',
    )

    const now = Date.now()
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

    // Create an old expense
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

    // Create a recent expense
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

    // Filter with date_from set between the two timestamps
    const midPoint = oneWeekAgo + (now - oneWeekAgo) / 2

    const response = await SELF.fetch(
      `https://example.com/api/v1/expenses?date_from=${midPoint}`,
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string }>
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Recent expense')
  })

  it('filters expenses by category_key', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-category:list-category@example.com',
    )

    // Create food expense
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

    // Create transport expense
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

    // Filter by food category
    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses?category_key=food',
      {
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
      },
    )

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string; categoryKey: string }>
      }>
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

  it('excludes soft-deleted expenses from list results', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-softdelete:list-softdelete@example.com',
    )

    // Create two expenses
    const createRes1 = await SELF.fetch('https://example.com/api/v1/expenses', {
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
        title: 'To be deleted',
        occurredAt: Date.now(),
      }),
    })
    expect(createRes1.status).toBe(201)
    const created1 = await parseJson<ApiEnvelope<{ id: string }>>(createRes1)
    const expenseIdToDelete = created1.data.id

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
        title: 'Keep me',
        occurredAt: Date.now(),
      }),
    })

    // Soft-delete the first expense directly via DB
    await env.DB.prepare('UPDATE expenses SET deleted_at = ? WHERE id = ?')
      .bind(Date.now(), expenseIdToDelete)
      .run()

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
      },
    })

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{ id: string; title: string }>
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Keep me')
    expect(
      payload.data.items.find((i) => i.id === expenseIdToDelete),
    ).toBeUndefined()
  })

  it('excludes private expenses of other users from personal feed', async () => {
    const userA = await exchangeAccessToken(
      'test:firebase-user-list-exclude-other-a:exclude-a@example.com',
    )
    const userB = await exchangeAccessToken(
      'test:firebase-user-list-exclude-other-b:exclude-b@example.com',
    )

    // User A creates a private expense
    const aRes = await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${userA.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 15000,
        categoryKey: 'food',
        sourceKey: 'cash',
        visibility: 'private',
        title: "User A's private expense",
        occurredAt: Date.now(),
      }),
    })
    expect(aRes.status).toBe(201)

    // User B creates their own private expense
    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${userB.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 25000,
        categoryKey: 'transport',
        sourceKey: 'cash',
        visibility: 'private',
        title: "User B's private expense",
        occurredAt: Date.now(),
      }),
    })

    // User B lists their personal feed — should only see their own expense
    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      headers: {
        authorization: `Bearer ${userB.accessToken}`,
      },
    })

    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string; createdByUserId: string }>
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe("User B's private expense")
    expect(payload.data.items[0].createdByUserId).toBe(userB.user.id)
  })

  it('returns 401 when listing without authentication', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/expenses')

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns 400 for invalid limit parameter', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-invalid-limit:list-invalid-limit@example.com',
    )

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses?limit=0',
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
