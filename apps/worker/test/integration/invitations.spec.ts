import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import { insertHouseholdFixture } from '../helpers/household-fixtures'
import {
  type ApiEnvelope,
  type ApiErrorEnvelope,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: invitations', () => {
  it('creates an invitation for household admin', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-invite-create-owner:invite-create-owner@example.com',
    )

    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Invite' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const createInvitationResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/invitations`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          role: 'member',
          ttlHours: 24,
        }),
      },
    )
    const createInvitationPayload = await parseJson<
      ApiEnvelope<{
        invitationId: string
        invitedRole: 'member' | 'admin'
        token: string
        invitePath: string
        expiresAt: number
      }>
    >(createInvitationResponse)

    expect(createInvitationResponse.status).toBe(201)
    expect(createInvitationPayload.data.invitationId.length).toBeGreaterThan(0)
    expect(createInvitationPayload.data.invitedRole).toBe('member')
    expect(createInvitationPayload.data.token.length).toBeGreaterThan(20)
    expect(createInvitationPayload.data.invitePath).toContain('/invitations/')
  })

  it('returns forbidden when non-admin member creates invitation', async () => {
    await insertHouseholdFixture(env.DB)

    const member = await exchangeAccessToken(
      'test:firebase-user-invite-create-member:invite-create-member@example.com',
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
      .bind('hm-invite-create-member', 'h1', member.user.id, 'member', 'active')
      .run()

    const response = await SELF.fetch(
      'https://example.com/api/v1/households/h1/invitations',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${member.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          role: 'member',
          ttlHours: 72,
        }),
      },
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('returns invitation preview for a valid token', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-invite-preview-owner:invite-preview-owner@example.com',
    )

    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Preview' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const createInvitationResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/invitations`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          role: 'admin',
          ttlHours: 72,
        }),
      },
    )
    const createInvitationPayload = await parseJson<
      ApiEnvelope<{ token: string }>
    >(createInvitationResponse)

    const previewResponse = await SELF.fetch(
      `https://example.com/api/v1/invitations/${createInvitationPayload.data.token}`,
    )
    const previewPayload = await parseJson<
      ApiEnvelope<{
        household: { id: string; name: string }
        invitedRole: 'member' | 'admin'
      }>
    >(previewResponse)

    expect(previewResponse.status).toBe(200)
    expect(previewPayload.data.household.id).toBe(
      createdHouseholdPayload.data.id,
    )
    expect(previewPayload.data.invitedRole).toBe('admin')
  })

  it('accepts invitation for authenticated user', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-invite-accept-owner:invite-accept-owner@example.com',
    )

    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Accept' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const createInvitationResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/invitations`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          role: 'member',
          ttlHours: 72,
        }),
      },
    )
    const createInvitationPayload = await parseJson<
      ApiEnvelope<{ invitationId: string; token: string }>
    >(createInvitationResponse)

    const recipient = await exchangeAccessToken(
      'test:firebase-user-invite-accept-recipient:invite-accept-recipient@example.com',
    )

    const acceptResponse = await SELF.fetch(
      `https://example.com/api/v1/invitations/${createInvitationPayload.data.token}/accept`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${recipient.accessToken}`,
        },
      },
    )
    const acceptPayload =
      await parseJson<
        ApiEnvelope<{ householdId: string; role: 'member' | 'admin' }>
      >(acceptResponse)

    expect(acceptResponse.status).toBe(200)
    expect(acceptPayload.data).toEqual({
      householdId: createdHouseholdPayload.data.id,
      role: 'member',
    })

    const invitationUsage = await env.DB.prepare(
      `SELECT used_at
         FROM household_invitations
         WHERE id = ?
         LIMIT 1`,
    )
      .bind(createInvitationPayload.data.invitationId)
      .first<{ used_at: number | null }>()

    expect(typeof invitationUsage?.used_at).toBe('number')
  })

  it('returns not found for invalid invitation token preview', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/invitations/invalid-token-preview',
    )
    const payload = await parseJson<ApiErrorEnvelope>(response)

    expect(response.status).toBe(404)
    expect(payload.error.code).toBe('NOT_FOUND')
  })

  it('rejects second accept on the same invitation token', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-invite-accept-reused-owner:invite-accept-reused-owner@example.com',
    )

    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Reused Token' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const createInvitationResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/invitations`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          role: 'member',
          ttlHours: 72,
        }),
      },
    )
    const createInvitationPayload = await parseJson<
      ApiEnvelope<{ token: string }>
    >(createInvitationResponse)

    const firstRecipient = await exchangeAccessToken(
      'test:firebase-user-invite-first-recipient:invite-first-recipient@example.com',
    )
    const secondRecipient = await exchangeAccessToken(
      'test:firebase-user-invite-second-recipient:invite-second-recipient@example.com',
    )

    const firstAcceptResponse = await SELF.fetch(
      `https://example.com/api/v1/invitations/${createInvitationPayload.data.token}/accept`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${firstRecipient.accessToken}`,
        },
      },
    )
    expect(firstAcceptResponse.status).toBe(200)

    const secondAcceptResponse = await SELF.fetch(
      `https://example.com/api/v1/invitations/${createInvitationPayload.data.token}/accept`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${secondRecipient.accessToken}`,
        },
      },
    )
    const secondAcceptPayload =
      await parseJson<ApiErrorEnvelope>(secondAcceptResponse)

    expect(secondAcceptResponse.status).toBe(409)
    expect(secondAcceptPayload.error.code).toBe('CONFLICT')
  })

  it('rejects accepting invitation when user is already an active member', async () => {
    const owner = await exchangeAccessToken(
      'test:firebase-user-invite-accept-existing-owner:invite-accept-existing-owner@example.com',
    )

    const createHouseholdResponse = await SELF.fetch(
      'https://example.com/api/v1/households',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: 'Family Existing Member' }),
      },
    )
    const createdHouseholdPayload = await parseJson<
      ApiEnvelope<{ id: string }>
    >(createHouseholdResponse)

    const createInvitationResponse = await SELF.fetch(
      `https://example.com/api/v1/households/${createdHouseholdPayload.data.id}/invitations`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${owner.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          role: 'member',
          ttlHours: 72,
        }),
      },
    )
    const createInvitationPayload = await parseJson<
      ApiEnvelope<{ token: string }>
    >(createInvitationResponse)

    const recipient = await exchangeAccessToken(
      'test:firebase-user-invite-accept-existing-recipient:invite-accept-existing-recipient@example.com',
    )

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
        'hm-invite-existing-member',
        createdHouseholdPayload.data.id,
        recipient.user.id,
        'member',
        'active',
        Date.now(),
        Date.now(),
        Date.now(),
      )
      .run()

    const acceptResponse = await SELF.fetch(
      `https://example.com/api/v1/invitations/${createInvitationPayload.data.token}/accept`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${recipient.accessToken}`,
        },
      },
    )
    const acceptPayload = await parseJson<ApiErrorEnvelope>(acceptResponse)

    expect(acceptResponse.status).toBe(409)
    expect(acceptPayload.error.code).toBe('CONFLICT')
  })
})
