import { env } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  createRefreshSession,
  findSessionById,
  revokeSessionIfActive,
} from '@/db/repositories/session-repository'
import { applyMigrations } from '../helpers/apply-migrations'

describe('session repository', () => {
  beforeEach(async () => {
    await applyMigrations(env.DB)

    await env.DB.exec('DELETE FROM refresh_sessions')
    await env.DB.exec('DELETE FROM auth_identities')
    await env.DB.exec('DELETE FROM users')
  })

  it('revokes active session only once', async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, display_name, primary_email)
       VALUES (?, ?, ?)`,
    )
      .bind('user-1', 'User One', 'user1@example.com')
      .run()

    const createdSession = await createRefreshSession(env.DB, {
      sessionId: 'session-1',
      userId: 'user-1',
      tokenHash: 'hash-1',
      expiresAt: Date.now() + 60_000,
      userAgent: null,
      ipAddress: null,
    })

    const firstRevokeResult = await revokeSessionIfActive(
      env.DB,
      createdSession.id,
    )
    const secondRevokeResult = await revokeSessionIfActive(
      env.DB,
      createdSession.id,
    )
    const storedSession = await findSessionById(env.DB, createdSession.id)

    expect(firstRevokeResult).toBe(true)
    expect(secondRevokeResult).toBe(false)
    expect(storedSession?.revokedAt).not.toBeNull()
  })
})
