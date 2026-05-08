import { describe, expect, it } from 'vitest'

import {
  SELF,
  env,
  exchangeProfileToken,
  parseJson,
  type ApiEnvelope,
} from './profile-patch.test-setup'

describe('Worker integration: profile patch updates', () => {
  it('updates display name only on profile patch', async () => {
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-name:user-profile-name@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'Updated Name',
        quickAddLastSourceKey: 'cash',
      }),
    })

    const payload = await parseJson<
      ApiEnvelope<{
        createdAt: number
        id: string
        email: string | null
        displayName: string | null
        avatarUrl: string | null
        quickAddLastSourceKey: string | null
      }>
    >(response)

    expect(response.status).toBe(200)
    expect(typeof payload.data.createdAt).toBe('number')
    expect(payload.data.displayName).toBe('Updated Name')
    expect(payload.data.avatarUrl).toBeNull()
    expect(payload.data.quickAddLastSourceKey).toBe('cash')

    const storedUser = await env.DB.prepare(
      `SELECT display_name, avatar_url, quick_add_last_source_key
        FROM users
        WHERE id = ?`,
    )
      .bind(exchange.payload.data.user.id)
      .first<{
        display_name: string | null
        avatar_url: string | null
        quick_add_last_source_key: string | null
      }>()

    expect(storedUser).toEqual({
      display_name: 'Updated Name',
      avatar_url: null,
      quick_add_last_source_key: 'cash',
    })
  })

  it('updates avatar URL only on profile patch', async () => {
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-avatar:user-profile-avatar@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        avatarUrl: 'https://firebasestorage.googleapis.com/avatar.png',
      }),
    })

    const payload =
      await parseJson<
        ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
      >(response)

    expect(response.status).toBe(200)
    expect(payload.data.displayName).toBeNull()
    expect(payload.data.avatarUrl).toBe(
      'https://firebasestorage.googleapis.com/avatar.png',
    )
  })

  it('updates both display name and avatar URL on profile patch', async () => {
    const exchange = await exchangeProfileToken(
      'test:firebase-user-profile-both:user-profile-both@example.com',
    )

    const response = await SELF.fetch('https://example.com/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${exchange.payload.data.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        displayName: 'Parent One',
        avatarUrl: 'https://firebasestorage.googleapis.com/parent-one.png',
      }),
    })

    const payload =
      await parseJson<
        ApiEnvelope<{ displayName: string | null; avatarUrl: string | null }>
      >(response)

    expect(response.status).toBe(200)
    expect(payload.data).toMatchObject({
      displayName: 'Parent One',
      avatarUrl: 'https://firebasestorage.googleapis.com/parent-one.png',
    })
  })
})
