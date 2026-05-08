import { describe, expect, it } from 'vitest'

import {
  SELF,
  env,
  exchangeAccessToken,
  parseJson,
  type ApiEnvelope,
} from './households-members.test-setup'

describe('Worker integration: household member actions - list', () => {
  it('lists household members for both admin and member callers', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-members-list-owner:members-list-owner@example.com',
    )
    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Members List' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const member = await exchangeAccessToken(
      'test:firebase-user-members-list-member:members-list-member@example.com',
    )
    const now = Date.now()
    await env.DB.prepare(
      `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state,
          joined_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        'hm-members-list-member',
        createdHouseholdPayload.data.id,
        member.user.id,
        'member',
        'active',
        now,
        now,
        now,
      )
      .run()

    const adminListResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/members`,
      {
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const adminListPayload = await parseJson<
      ApiEnvelope<{
        items: Array<{
          userId: string
          role: 'admin' | 'member'
        }>
      }>
    >(adminListResponse)

    expect(adminListResponse.status).toBe(200)
    expect(adminListPayload.data.items).toHaveLength(2)
    expect(
      adminListPayload.data.items.some(
        (item) => item.userId === owner.user.id && item.role === 'admin',
      ),
    ).toBe(true)
    expect(
      adminListPayload.data.items.some(
        (item) => item.userId === member.user.id && item.role === 'member',
      ),
    ).toBe(true)

    const memberListResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/members`,
      {
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )
    const memberListPayload = await parseJson<
      ApiEnvelope<{
        items: Array<{
          userId: string
        }>
      }>
    >(memberListResponse)

    expect(memberListResponse.status).toBe(200)
    expect(memberListPayload.data.items).toHaveLength(2)
  })

  it('returns not found when non-member lists household members', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-members-list-404-owner:members-list-404-owner@example.com',
    )
    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Members Forbidden' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const outsider = await exchangeAccessToken(
      'test:firebase-user-members-list-outsider:members-list-outsider@example.com',
    )

    const response = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/members`,
      {
        headers: {
          authorization: `Bearer ${outsider.accessToken}`,
        },
      },
    )
    const payload =
      await parseJson<
        import('./households-members.test-setup').ApiErrorEnvelope
      >(response)

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })
})
