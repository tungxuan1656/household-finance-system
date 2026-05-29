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

describe('GET /api/v1/expenses - household and access rules', () => {
  it('keeps the creators own household expense in personal feed after creator leaves household', async () => {
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
          householdId: string | null
          currencyCode: string
        }>
        nextCursor: string | null
      }>
    >(response)

    expect(payload.success).toBe(true)
    expect(payload.data.items).toHaveLength(1)
    expect(payload.data.items[0].title).toBe('Former member shared expense')
    expect(payload.data.items[0].householdId).toBe(householdId)
    expect(payload.data.nextCursor).toBeNull()
  })

  it('returns 403 when household_id list request is not by member', async () => {
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
})
