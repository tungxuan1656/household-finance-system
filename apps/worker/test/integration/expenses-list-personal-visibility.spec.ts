import { describe, expect, it } from 'vitest'

import {
  SELF,
  env,
  type ApiEnvelope,
  exchangeAccessToken,
  parseJson,
} from './expenses-list-personal.test-setup'

describe('GET /api/v1/expenses personal visibility', () => {
  it('excludes soft-deleted expenses from list results', async () => {
    const auth = await exchangeAccessToken(
      'test:firebase-user-list-softdelete:list-softdelete@example.com',
    )

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
        title: 'Keep me',
        occurredAt: Date.now(),
      }),
    })

    await env.DB.prepare('UPDATE expenses SET deleted_at = ? WHERE id = ?')
      .bind(Date.now(), expenseIdToDelete)
      .run()

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      headers: { authorization: `Bearer ${auth.accessToken}` },
    })
    expect(response.status).toBe(200)

    const payload =
      await parseJson<
        ApiEnvelope<{ items: Array<{ id: string; title: string }> }>
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

    await SELF.fetch('https://example.com/api/v1/expenses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${userA.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 15000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: "User A's private expense",
        occurredAt: Date.now(),
      }),
    })
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
        title: "User B's private expense",
        occurredAt: Date.now(),
      }),
    })

    const response = await SELF.fetch('https://example.com/api/v1/expenses', {
      headers: { authorization: `Bearer ${userB.accessToken}` },
    })
    expect(response.status).toBe(200)

    const payload = await parseJson<
      ApiEnvelope<{
        items: Array<{ title: string; spentByUserId: string }>
      }>
    >(response)
    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe("User B's private expense")
    expect(payload.data.items[0].spentByUserId).toBe(userB.user.id)
  })
})
