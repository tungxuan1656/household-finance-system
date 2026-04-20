import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
  SELF,
} from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'

import { applyMigrations } from './helpers/apply-migrations'
import worker from '@/index'

const IncomingRequest = Request

const clearTableStatements = [
  'DELETE FROM reward_request_events',
  'DELETE FROM reward_requests',
  'DELETE FROM rewards',
  'DELETE FROM contribution_events',
  'DELETE FROM contributions',
  'DELETE FROM point_balances',
  'DELETE FROM points_ledger',
  'DELETE FROM user_preferences',
  'DELETE FROM child_profiles',
  'DELETE FROM family_members',
  'DELETE FROM families',
  'DELETE FROM refresh_sessions',
  'DELETE FROM auth_identities',
  'DELETE FROM users',
]

type ApiEnvelope<T> = {
  data: T
  meta: {
    requestId: string
  }
}

const parseJson = async <T>(response: Response): Promise<T> =>
  response.json() as Promise<T>

const insertFamilyTestGraph = async (): Promise<void> => {
  await env.DB.prepare(
    `INSERT INTO users (id, display_name, primary_email)
     VALUES
     ('u1', 'Owner', 'owner@example.com'),
     ('u2', 'Adult', 'adult@example.com')`,
  ).run()

  await env.DB.prepare(
    `INSERT INTO families (id, name, created_by)
     VALUES ('f1', 'Family One', 'u1')`,
  ).run()

  await env.DB.prepare(
    `INSERT INTO family_members (id, family_id, user_id, role, state)
     VALUES
     ('m1', 'f1', 'u1', 'owner', 'active'),
     ('m2', 'f1', 'u2', 'adult', 'active')`,
  ).run()

  await env.DB.prepare(
    `INSERT INTO rewards (
      id,
      family_id,
      title,
      point_type,
      point_cost,
      decision_owner_member_id,
      status
    )
    VALUES ('r1', 'f1', 'Movie Night', 'task', 10, 'm1', 'active')`,
  ).run()
}

beforeEach(async () => {
  await applyMigrations(env.DB)

  for (const statement of clearTableStatements) {
    await env.DB.exec(statement)
  }
})

describe('Worker foundation', () => {
  it('responds with health payload', async () => {
    const request = new IncomingRequest('http://example.com/api/v1/health')
    const ctx = createExecutionContext()
    const response = await worker.fetch(request, env, ctx)

    await waitOnExecutionContext(ctx)
    const payload = await parseJson<ApiEnvelope<{ ok: boolean }>>(response)

    expect(response.status).toBe(200)
    expect(payload.data.ok).toBe(true)
    expect(payload.meta.requestId.length).toBeGreaterThan(0)
  })

  it('returns invalid input when auth exchange payload is malformed', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ provider: 'firebase' }),
      },
    )

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects protected route when bearer token is missing', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
    )

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns current profile for an authenticated user', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile:user-profile@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        user: {
          id: string
          email: string | null
          displayName: string | null
          avatarUrl: string | null
        }
      }>
    >(exchangeResponse)

    const profileResponse = await SELF.fetch(
      'https://example.com/api/v1/profile',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const profilePayload = await parseJson<
      ApiEnvelope<{
        id: string
        email: string | null
        displayName: string | null
        avatarUrl: string | null
      }>
    >(profileResponse)

    expect(profileResponse.status).toBe(200)
    expect(profilePayload.data).toEqual({
      id: exchangePayload.data.user.id,
      email: 'user-profile@example.com',
      displayName: null,
      avatarUrl: null,
    })
  })

  it('rejects current profile request when bearer token is missing', async () => {
    const response = await SELF.fetch('https://example.com/api/v1/profile')

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('updates display name only on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-name:user-profile-name@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{ accessToken: string; user: { id: string } }>
    >(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'Updated Name',
      }),
    })

    const payload = await parseJson<
      ApiEnvelope<{
        id: string
        email: string | null
        displayName: string | null
        avatarUrl: string | null
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(payload.data.displayName).toBe('Updated Name')
    expect(payload.data.avatarUrl).toBeNull()

    const storedUser = await env.DB.prepare(
      `SELECT display_name, avatar_url
       FROM users
       WHERE id = ?`,
    )
      .bind(exchangePayload.data.user.id)
      .first<{ display_name: string | null; avatar_url: string | null }>()

    expect(storedUser).toEqual({
      display_name: 'Updated Name',
      avatar_url: null,
    })
  })

  it('updates avatar URL only on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-avatar:user-profile-avatar@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{ accessToken: string; user: { id: string } }>
    >(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        avatarUrl: 'https://firebasestorage.googleapis.com/avatar.png',
      }),
    })

    const payload = await parseJson<
      ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
    >(response)

    expect(response.status).toBe(200)
    expect(payload.data.displayName).toBeNull()
    expect(payload.data.avatarUrl).toBe(
      'https://firebasestorage.googleapis.com/avatar.png',
    )
  })

  it('updates both display name and avatar URL on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-both:user-profile-both@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{ accessToken: string }>
    >(exchangeResponse)

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'Parent One',
        avatarUrl: 'https://firebasestorage.googleapis.com/parent-one.png',
      }),
    })

    const payload = await parseJson<
      ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
    >(response)

    expect(response.status).toBe(200)
    expect(payload.data).toMatchObject({
      displayName: 'Parent One',
      avatarUrl: 'https://firebasestorage.googleapis.com/parent-one.png',
    })
  })

  it('clears display name and avatar URL on profile patch with null values', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-clear:user-profile-clear@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{ accessToken: string; user: { id: string } }>
    >(exchangeResponse)

    await env.DB.prepare(
      `UPDATE users
       SET display_name = ?, avatar_url = ?
       WHERE id = ?`,
    )
      .bind(
        'Needs Clearing',
        'https://firebasestorage.googleapis.com/needs-clearing.png',
        exchangePayload.data.user.id,
      )
      .run()

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: null,
        avatarUrl: null,
      }),
    })

    const payload = await parseJson<
      ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
    >(response)

    expect(response.status).toBe(200)
    expect(payload.data).toMatchObject({
      displayName: null,
      avatarUrl: null,
    })
  })

  it('rejects invalid avatar URL on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-invalid-avatar:user-profile-invalid-avatar@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<ApiEnvelope<{ accessToken: string }>>(
      exchangeResponse,
    )

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        avatarUrl: 'not-a-url',
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects blank trimmed display name on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-blank-name:user-profile-blank-name@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<ApiEnvelope<{ accessToken: string }>>(
      exchangeResponse,
    )

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: '   ',
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects unknown fields on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-unknown:user-profile-unknown@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<ApiEnvelope<{ accessToken: string }>>(
      exchangeResponse,
    )

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'Known',
        provider: 'firebase',
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects attempts to send email on profile patch', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-email:user-profile-email@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<ApiEnvelope<{ accessToken: string }>>(
      exchangeResponse,
    )

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: 'hijack@example.com',
      }),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('rejects empty profile patch payload', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-profile-empty:user-profile-empty@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<ApiEnvelope<{ accessToken: string }>>(
      exchangeResponse,
    )

    const response = await SELF.fetch('https://example.com/api/v1/profile', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchangePayload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const payload = await parseJson<{ error: { code: string } }>(response)

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('exchanges firebase token and accesses protected route', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-1:user1@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
        user: {
          id: string
          email: string | null
        }
      }>
    >(exchangeResponse)

    expect(exchangeResponse.status).toBe(200)
    expect(exchangePayload.data.user.email).toBe('user1@example.com')

    const protectedResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const protectedPayload = await parseJson<
      ApiEnvelope<{
        ok: boolean
        user: {
          id: string
          email: string | null
        }
      }>
    >(protectedResponse)

    expect(protectedResponse.status).toBe(200)
    expect(protectedPayload.data.ok).toBe(true)
    expect(protectedPayload.data.user.id).toBe(exchangePayload.data.user.id)
  })

  it('preserves existing user profile fields on sparse provider claims', async () => {
    const initialExchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-sparse:user-sparse@example.com',
        }),
      },
    )

    const initialExchangePayload = await parseJson<
      ApiEnvelope<{
        user: {
          id: string
          email: string | null
        }
      }>
    >(initialExchangeResponse)

    await env.DB.prepare(
      `UPDATE users
       SET display_name = ?, avatar_url = ?
       WHERE id = ?`,
    )
      .bind(
        'Saved Name',
        'https://cdn.example.com/avatar.png',
        initialExchangePayload.data.user.id,
      )
      .run()

    const sparseExchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-sparse',
        }),
      },
    )

    const sparseExchangePayload = await parseJson<
      ApiEnvelope<{
        user: {
          email: string | null
          displayName: string | null
          avatarUrl: string | null
        }
      }>
    >(sparseExchangeResponse)

    expect(sparseExchangeResponse.status).toBe(200)
    expect(sparseExchangePayload.data.user.email).toBe(
      'user-sparse@example.com',
    )
    expect(sparseExchangePayload.data.user.displayName).toBe('Saved Name')
    expect(sparseExchangePayload.data.user.avatarUrl).toBe(
      'https://cdn.example.com/avatar.png',
    )
  })

  it('refreshes mirrored profile fields from provider claims when claims are present', async () => {
    const initialExchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-claim-refresh:user-claim-refresh@example.com',
        }),
      },
    )

    const initialExchangePayload = await parseJson<
      ApiEnvelope<{
        user: {
          id: string
        }
      }>
    >(initialExchangeResponse)

    await env.DB.prepare(
      `UPDATE users
       SET display_name = ?, avatar_url = ?
       WHERE id = ?`,
    )
      .bind(
        'Mirrored Name',
        'https://cdn.example.com/mirrored-avatar.png',
        initialExchangePayload.data.user.id,
      )
      .run()

    const secondExchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken:
            'test:firebase-user-claim-refresh:user-claim-refresh@example.com:Firebase Name:https://firebasestorage.googleapis.com/firebase-avatar.png',
        }),
      },
    )

    const secondExchangePayload = await parseJson<
      ApiEnvelope<{
        user: {
          displayName: string | null
          avatarUrl: string | null
        }
      }>
    >(secondExchangeResponse)

    expect(secondExchangeResponse.status).toBe(200)
    expect(secondExchangePayload.data.user.displayName).toBe('Firebase Name')
    expect(secondExchangePayload.data.user.avatarUrl).toBe(
      'https://firebasestorage.googleapis.com/firebase-avatar.png',
    )
  })

  it('rotates refresh token and invalidates old refresh token', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-2:user2@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
      }>
    >(exchangeResponse)

    const refreshResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: exchangePayload.data.refreshToken,
        }),
      },
    )

    const refreshPayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
      }>
    >(refreshResponse)

    expect(refreshResponse.status).toBe(200)
    expect(refreshPayload.data.accessToken).not.toBe(
      exchangePayload.data.accessToken,
    )
    expect(refreshPayload.data.refreshToken).not.toBe(
      exchangePayload.data.refreshToken,
    )

    const oldRefreshReplayResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: exchangePayload.data.refreshToken,
        }),
      },
    )

    const oldRefreshReplayPayload = await parseJson<{
      error: { code: string }
    }>(oldRefreshReplayResponse)

    expect(oldRefreshReplayResponse.status).toBe(401)
    expect(oldRefreshReplayPayload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects old access token after refresh rotation', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-3:user3@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        refreshToken: string
      }>
    >(exchangeResponse)

    const refreshResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/refresh',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: exchangePayload.data.refreshToken,
        }),
      },
    )

    expect(refreshResponse.status).toBe(200)

    const protectedResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const protectedPayload = await parseJson<{
      error: { code: string }
    }>(protectedResponse)

    expect(protectedResponse.status).toBe(401)
    expect(protectedPayload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects access token when user has been deleted', async () => {
    const exchangeResponse = await SELF.fetch(
      'https://example.com/api/v1/auth/provider/exchange',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'firebase',
          idToken: 'test:firebase-user-4:user4@example.com',
        }),
      },
    )

    const exchangePayload = await parseJson<
      ApiEnvelope<{
        accessToken: string
        user: { id: string }
      }>
    >(exchangeResponse)

    await env.DB.prepare('DELETE FROM refresh_sessions WHERE user_id = ?')
      .bind(exchangePayload.data.user.id)
      .run()

    await env.DB.prepare('DELETE FROM auth_identities WHERE user_id = ?')
      .bind(exchangePayload.data.user.id)
      .run()

    await env.DB.prepare('DELETE FROM users WHERE id = ?')
      .bind(exchangePayload.data.user.id)
      .run()

    const protectedResponse = await SELF.fetch(
      'https://example.com/api/v1/protected/ping',
      {
        headers: {
          authorization: `Bearer ${exchangePayload.data.accessToken}`,
        },
      },
    )

    const protectedPayload = await parseJson<{
      error: { code: string }
    }>(protectedResponse)

    expect(protectedResponse.status).toBe(401)
    expect(protectedPayload.error.code).toBe('UNAUTHENTICATED')
  })

  it('rejects invalid point_type via schema CHECK', async () => {
    await insertFamilyTestGraph()

    await expect(
      env.DB.prepare(
        `INSERT INTO contributions (
          id,
          family_id,
          actor_member_id,
          subject_member_id,
          point_type,
          point_value,
          state,
          description
        )
        VALUES ('c1', 'f1', 'm1', 'm2', 'bonus', 5, 'pending', 'invalid type')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects cross-family references via composite FK', async () => {
    await insertFamilyTestGraph()

    await env.DB.prepare(
      `INSERT INTO contributions (
        id,
        family_id,
        actor_member_id,
        subject_member_id,
        point_type,
        point_value,
        state,
        description
      )
      VALUES ('c1', 'f1', 'm1', 'm2', 'task', 5, 'pending', 'valid')`,
    ).run()

    await env.DB.prepare(
      `INSERT INTO users (id, display_name, primary_email)
       VALUES ('u3', 'Owner Two', 'owner2@example.com')`,
    ).run()

    await env.DB.prepare(
      `INSERT INTO families (id, name, created_by)
       VALUES ('f2', 'Family Two', 'u3')`,
    ).run()

    await env.DB.prepare(
      `INSERT INTO family_members (id, family_id, user_id, role, state)
       VALUES ('m3', 'f2', 'u3', 'owner', 'active')`,
    ).run()

    await expect(
      env.DB.prepare(
        `INSERT INTO contribution_events (
          id,
          family_id,
          contribution_id,
          event_type,
          actor_member_id,
          visibility,
          note
        )
        VALUES ('ce1', 'f2', 'c1', 'submitted', 'm3', 'all', 'cross family')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects non-positive points for contribution and reward request snapshot', async () => {
    await insertFamilyTestGraph()

    await expect(
      env.DB.prepare(
        `INSERT INTO contributions (
          id,
          family_id,
          actor_member_id,
          subject_member_id,
          point_type,
          point_value,
          state,
          description
        )
        VALUES ('c1', 'f1', 'm1', 'm2', 'task', 0, 'pending', 'invalid point value')`,
      ).run(),
    ).rejects.toThrow()

    await expect(
      env.DB.prepare(
        `INSERT INTO reward_requests (
          id,
          family_id,
          reward_id,
          requester_member_id,
          point_cost_snapshot,
          state
        )
        VALUES ('rr1', 'f1', 'r1', 'm2', 0, 'submitted')`,
      ).run(),
    ).rejects.toThrow()
  })

  it('rejects invalid event_type via schema CHECK', async () => {
    await insertFamilyTestGraph()

    await env.DB.prepare(
      `INSERT INTO contributions (
        id,
        family_id,
        actor_member_id,
        subject_member_id,
        point_type,
        point_value,
        state,
        description
      )
      VALUES ('c1', 'f1', 'm1', 'm2', 'task', 5, 'pending', 'valid')`,
    ).run()

    await expect(
      env.DB.prepare(
        `INSERT INTO contribution_events (
          id,
          family_id,
          contribution_id,
          event_type,
          actor_member_id,
          visibility,
          note
        )
        VALUES ('ce1', 'f1', 'c1', 'accepted', 'm1', 'all', 'invalid event')`,
      ).run(),
    ).rejects.toThrow()

    await env.DB.prepare(
      `INSERT INTO reward_requests (
        id,
        family_id,
        reward_id,
        requester_member_id,
        point_cost_snapshot,
        state
      )
      VALUES ('rr1', 'f1', 'r1', 'm2', 10, 'submitted')`,
    ).run()

    await expect(
      env.DB.prepare(
        `INSERT INTO reward_request_events (
          id,
          family_id,
          reward_request_id,
          event_type,
          actor_member_id,
          visibility,
          note
        )
        VALUES ('rre1', 'f1', 'rr1', 'approved', 'm1', 'all', 'invalid event')`,
      ).run(),
    ).rejects.toThrow()
  })
})
