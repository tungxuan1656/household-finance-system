import { newId } from '@/utils/shared/id'

export interface RefreshSession {
  id: string
  userId: string
  tokenHash: string
  expiresAt: number
  revokedAt: number | null
}

const toRefreshSession = (row: {
  id: string
  user_id: string
  token_hash: string
  expires_at: number
  revoked_at: number | null
}): RefreshSession => ({
  id: row.id,
  userId: row.user_id,
  tokenHash: row.token_hash,
  expiresAt: row.expires_at,
  revokedAt: row.revoked_at,
})

export const createRefreshSession = async (
  db: D1Database,
  input: {
    sessionId?: string
    userId: string
    tokenHash: string
    expiresAt: number
    userAgent: string | null
    ipAddress: string | null
  },
): Promise<RefreshSession> => {
  const sessionId = input.sessionId ?? newId()

  await db
    .prepare(
      `INSERT INTO refresh_sessions (id, user_id, token_hash, expires_at, user_agent, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      sessionId,
      input.userId,
      input.tokenHash,
      input.expiresAt,
      input.userAgent,
      input.ipAddress,
    )
    .run()

  return {
    id: sessionId,
    userId: input.userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    revokedAt: null,
  }
}

export const findSessionByIdAndHash = async (
  db: D1Database,
  sessionId: string,
  tokenHash: string,
): Promise<RefreshSession | null> => {
  const row = await db
    .prepare(
      `SELECT id, user_id, token_hash, expires_at, revoked_at
       FROM refresh_sessions
       WHERE id = ? AND token_hash = ?
       LIMIT 1`,
    )
    .bind(sessionId, tokenHash)
    .first<{
      id: string
      user_id: string
      token_hash: string
      expires_at: number
      revoked_at: number | null
    }>()

  if (!row) {
    return null
  }

  return toRefreshSession(row)
}

export const findSessionById = async (
  db: D1Database,
  sessionId: string,
): Promise<RefreshSession | null> => {
  const row = await db
    .prepare(
      `SELECT id, user_id, token_hash, expires_at, revoked_at
       FROM refresh_sessions
       WHERE id = ?
       LIMIT 1`,
    )
    .bind(sessionId)
    .first<{
      id: string
      user_id: string
      token_hash: string
      expires_at: number
      revoked_at: number | null
    }>()

  if (!row) {
    return null
  }

  return toRefreshSession(row)
}

export const revokeSessionIfActive = async (
  db: D1Database,
  sessionId: string,
): Promise<boolean> => {
  const nowEpoch = Date.now()

  const result = await db
    .prepare(
      `UPDATE refresh_sessions
       SET revoked_at = ?, updated_at = ?
       WHERE id = ?
         AND revoked_at IS NULL
         AND expires_at > ?`,
    )
    .bind(nowEpoch, nowEpoch, sessionId, nowEpoch)
    .run()

  return Number(result.meta.changes ?? 0) === 1
}

export const isSessionActive = (session: RefreshSession): boolean => {
  if (session.revokedAt) {
    return false
  }

  return session.expiresAt > Date.now()
}
