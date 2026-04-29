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

describe('Worker integration: household member actions', () => {
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
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('allows admin to remove a household member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-members-remove-owner:members-remove-owner@example.com',
    )
    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Remove Member' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const member = await exchangeAccessToken(
      'test:firebase-user-members-remove-member:members-remove-member@example.com',
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
        'hm-members-remove-member',
        createdHouseholdPayload.data.id,
        member.user.id,
        'member',
        'active',
      )
      .run()

    const removeResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/members/${member.user.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const removePayload =
      await parseJson<ApiEnvelope<{ removed: true }>>(removeResponse)

    expect(removeResponse.status).toBe(200)
    expect(removePayload.data).toEqual({ removed: true })

    const membershipRow = await env.DB.prepare(
      `SELECT state
         FROM household_memberships
        WHERE household_id = ?
          AND user_id = ?
        LIMIT 1`,
    )
      .bind(createdHouseholdPayload.data.id, member.user.id)
      .first<{ state: string }>()

    expect(membershipRow?.state).toBe('removed')
  })

  it('returns forbidden when non-admin tries to remove member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-members-remove-403-owner:members-remove-403-owner@example.com',
    )
    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Remove Forbidden' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const member = await exchangeAccessToken(
      'test:firebase-user-members-remove-403-member:members-remove-403-member@example.com',
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
        'hm-members-remove-403-member',
        createdHouseholdPayload.data.id,
        member.user.id,
        'member',
        'active',
      )
      .run()

    const removeResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/members/${owner.user.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
        },
      },
    )
    const removePayload = await parseJson<ApiErrorEnvelope>(removeResponse)

    expect(removeResponse.status).toBe(403)
    expect(removePayload.error.code).toBe('FORBIDDEN')
  })

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
