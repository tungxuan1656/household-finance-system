import { SELF, env } from './households-members.test-setup'

import { describe, expect, it } from 'vitest'

import { exchangeAccessToken, parseJson } from './households-members.test-setup'
import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
} from './households-members.test-setup'

describe('Worker integration: household member actions - remove', () => {
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

  it('blocks admin removal when target is the last active admin', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-members-remove-last-admin:members-remove-last-admin@example.com',
    )
    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Remove Last Admin' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const removeResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/members/${owner.user.id}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
        },
      },
    )
    const removePayload = await parseJson<ApiErrorEnvelope>(removeResponse)

    expect(removeResponse.status).toBe(409)
    expect(removePayload.error.code).toBe('CONFLICT')
  })
})
