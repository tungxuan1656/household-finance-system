import { describe, expect, it } from 'vitest'

import {
  SELF,
  env,
  exchangeAccessToken,
  parseJson,
  type ApiEnvelope,
  type ApiErrorEnvelope,
} from './households-members.test-setup'

describe('Worker integration: household member actions - leave', () => {
  it('allows a non-admin member to leave household via members/me endpoint', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-members-leave-owner:members-leave-owner@example.com',
    )
    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Leave Member' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const member = await exchangeAccessToken(
      'test:firebase-user-members-leave-member:members-leave-member@example.com',
    )
    await env.DB.prepare(
      `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state
        )
        VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(
        'hm-members-leave-member',
        createdHouseholdPayload.data.id,
        member.user.id,
        'member',
        'active',
      )
      .run()

    const leaveResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/members/me`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )
    const leavePayload =
      await parseJson<ApiEnvelope<{ left: true }>>(leaveResponse)

    expect(leaveResponse.status).toBe(200)
    expect(leavePayload.data).toEqual({ left: true })

    const membershipRow = await env.DB.prepare(
      `SELECT state
         FROM household_memberships
        WHERE household_id = ?
          AND user_id = ?
        LIMIT 1`,
    )
      .bind(createdHouseholdPayload.data.id, member.user.id)
      .first<{ state: string }>()

    expect(membershipRow?.state).toBe('left')
  })

  it('blocks leaving household when caller is the last admin', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-members-leave-last-admin:members-leave-last-admin@example.com',
    )
    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Last Admin Leave' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const leaveResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/members/me`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const leavePayload = await parseJson<ApiErrorEnvelope>(leaveResponse)

    expect(leaveResponse.status).toBe(409)
    expect(leavePayload.error.code).toBe('CONFLICT')
  })
})
