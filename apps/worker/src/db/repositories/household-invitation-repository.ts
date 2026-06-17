import { newId } from '@/utils/id'

export interface CreateHouseholdInvitationInput {
  householdId: string
  tokenHash: string
  invitedRole: 'admin' | 'member'
  expiresAt: number
  createdByUserId: string
}

export interface StoredHouseholdInvitation {
  id: string
  householdId: string
  tokenHash: string
  invitedRole: 'admin' | 'member'
  expiresAt: number
  usedAt: number | null
  usedByUserId: string | null
  createdByUserId: string
}

export interface InvitationPreviewRow {
  invitationId: string
  householdId: string
  householdName: string
  invitedRole: 'admin' | 'member'
  expiresAt: number
  usedAt: number | null
  createdByUserId: string
}

const toStoredInvitation = (row: {
  id: string
  household_id: string
  token_hash: string
  invited_role: 'admin' | 'member'
  expires_at: number
  used_at: number | null
  used_by_user_id: string | null
  created_by_user_id: string
}): StoredHouseholdInvitation => ({
  id: row.id,
  householdId: row.household_id,
  tokenHash: row.token_hash,
  invitedRole: row.invited_role,
  expiresAt: row.expires_at,
  usedAt: row.used_at,
  usedByUserId: row.used_by_user_id,
  createdByUserId: row.created_by_user_id,
})

export const createHouseholdInvitation = async (
  db: D1Database,
  input: CreateHouseholdInvitationInput,
): Promise<StoredHouseholdInvitation> => {
  const id = newId()
  const nowEpoch = Date.now()

  await db
    .prepare(
      `INSERT INTO household_invitations (
        id,
        household_id,
        token_hash,
        invited_role,
        expires_at,
        created_by_user_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.householdId,
      input.tokenHash,
      input.invitedRole,
      input.expiresAt,
      input.createdByUserId,
      nowEpoch,
      nowEpoch,
    )
    .run()

  return {
    id,
    householdId: input.householdId,
    tokenHash: input.tokenHash,
    invitedRole: input.invitedRole,
    expiresAt: input.expiresAt,
    usedAt: null,
    usedByUserId: null,
    createdByUserId: input.createdByUserId,
  }
}

export const findInvitationPreviewByTokenHash = async (
  db: D1Database,
  tokenHash: string,
): Promise<InvitationPreviewRow | null> => {
  const nowEpoch = Date.now()

  const row = await db
    .prepare(
      `SELECT hi.id AS invitation_id,
              hi.household_id,
              h.name AS household_name,
              hi.invited_role,
              hi.expires_at,
              hi.used_at,
              hi.created_by_user_id
         FROM household_invitations hi
         INNER JOIN households h ON h.id = hi.household_id
        WHERE hi.token_hash = ?
          AND h.archived_at IS NULL
          AND hi.used_at IS NULL
          AND hi.expires_at > ?
        LIMIT 1`,
    )
    .bind(tokenHash, nowEpoch)
    .first<{
      invitation_id: string
      household_id: string
      household_name: string
      invited_role: 'admin' | 'member'
      expires_at: number
      used_at: number | null
      created_by_user_id: string
    }>()

  if (!row) {
    return null
  }

  return {
    invitationId: row.invitation_id,
    householdId: row.household_id,
    householdName: row.household_name,
    invitedRole: row.invited_role,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdByUserId: row.created_by_user_id,
  }
}

export const consumeInvitationById = async (
  db: D1Database,
  invitationId: string,
  usedByUserId: string,
  nowEpoch: number = Date.now(),
): Promise<boolean> => {
  const result = await db
    .prepare(
      `UPDATE household_invitations
       SET used_at = ?1,
           used_by_user_id = ?2,
           updated_at = ?1
       WHERE id = ?3
         AND used_at IS NULL
         AND expires_at > ?1`,
    )
    .bind(nowEpoch, usedByUserId, invitationId)
    .run()

  return Number(result.meta.changes ?? 0) === 1
}

export const createMembershipFromInvitation = async (
  db: D1Database,
  input: {
    householdId: string
    userId: string
    invitedRole: 'admin' | 'member'
    invitedByUserId: string
  },
  nowEpoch: number = Date.now(),
): Promise<'inserted' | 'reactivated' | 'already_active'> => {
  const existingMembership = await db
    .prepare(
      `SELECT id, state
         FROM household_memberships
        WHERE household_id = ?
          AND user_id = ?
        LIMIT 1`,
    )
    .bind(input.householdId, input.userId)
    .first<{
      id: string
      state: 'invited' | 'active' | 'left' | 'removed'
    }>()

  if (!existingMembership) {
    await db
      .prepare(
        `INSERT INTO household_memberships (
          id,
          household_id,
          user_id,
          role,
          state,
          invited_by_user_id,
          joined_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId(),
        input.householdId,
        input.userId,
        input.invitedRole,
        'active',
        input.invitedByUserId,
        nowEpoch,
        nowEpoch,
        nowEpoch,
      )
      .run()

    return 'inserted'
  }

  if (existingMembership.state === 'active') {
    return 'already_active'
  }

  await db
    .prepare(
      `UPDATE household_memberships
       SET role = ?1,
           state = 'active',
           invited_by_user_id = ?2,
           joined_at = ?3,
           archived_at = NULL,
           updated_at = ?3
       WHERE id = ?4`,
    )
    .bind(
      input.invitedRole,
      input.invitedByUserId,
      nowEpoch,
      existingMembership.id,
    )
    .run()

  return 'reactivated'
}

export const findHouseholdInvitationById = async (
  db: D1Database,
  invitationId: string,
): Promise<StoredHouseholdInvitation | null> => {
  const row = await db
    .prepare(
      `SELECT id,
              household_id,
              token_hash,
              invited_role,
              expires_at,
              used_at,
              used_by_user_id,
              created_by_user_id
         FROM household_invitations
        WHERE id = ?
        LIMIT 1`,
    )
    .bind(invitationId)
    .first<{
      id: string
      household_id: string
      token_hash: string
      invited_role: 'admin' | 'member'
      expires_at: number
      used_at: number | null
      used_by_user_id: string | null
      created_by_user_id: string
    }>()

  if (!row) {
    return null
  }

  return toStoredInvitation(row)
}
