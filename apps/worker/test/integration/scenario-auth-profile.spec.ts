import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

import {
  authorizedJsonRequest,
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
  type ApiEnvelope,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration: auth/profile scenario', () => {
  it('updates profile and then reads the persisted profile through helper requests', async () => {
    const session = await exchangeAccessToken(
      'test:firebase-user-scenario-auth-profile:user-scenario-auth-profile@example.com',
    )

    const updateResponse = await authorizedJsonRequest(session.accessToken, {
      method: 'PATCH',
      path: '/api/v1/users/me',
      body: {
        displayName: 'Scenario Auth Profile',
      },
    })

    const updatePayload = await parseJson<
      ApiEnvelope<{
        createdAt: number
        id: string
        email: string | null
        displayName: string | null
        avatarUrl: string | null
      }>
    >(updateResponse)

    const readResponse = await authorizedJsonRequest(session.accessToken, {
      method: 'GET',
      path: '/api/v1/users/me',
    })

    const readPayload = await parseJson<
      ApiEnvelope<{
        createdAt: number
        id: string
        email: string | null
        displayName: string | null
        avatarUrl: string | null
      }>
    >(readResponse)

    const storedUser = await env.DB.prepare(
      `SELECT display_name
       FROM users
       WHERE id = ?`,
    )
      .bind(session.user.id)
      .first<{ display_name: string | null }>()

    expect(updateResponse.status).toBe(200)
    expect(updatePayload.data.displayName).toBe('Scenario Auth Profile')
    expect(readResponse.status).toBe(200)
    expect(typeof readPayload.data.createdAt).toBe('number')
    expect(readPayload.data).toEqual({
      createdAt: readPayload.data.createdAt,
      id: session.user.id,
      email: 'user-scenario-auth-profile@example.com',
      displayName: 'Scenario Auth Profile',
      avatarUrl: null,
    })
    expect(storedUser).toEqual({
      display_name: 'Scenario Auth Profile',
    })
  })
})
