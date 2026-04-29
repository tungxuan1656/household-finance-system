import type { HouseholdMemberDTO, HouseholdRoleDTO } from '@/contracts'
import type { ResolvedHouseholdMembership } from '@/types'

export const findActiveHouseholdMembership = async (
  db: D1Database,
  userId: string,
  householdId: string,
): Promise<ResolvedHouseholdMembership | null> => {
  const membership = await db
    .prepare(
      `SELECT hm.id,
              hm.household_id,
              hm.user_id,
              hm.role
         FROM household_memberships hm
         INNER JOIN households h ON h.id = hm.household_id
        WHERE hm.user_id = ?
          AND hm.household_id = ?
          AND hm.state = 'active'
          AND h.archived_at IS NULL
        LIMIT 1`,
    )
    .bind(userId, householdId)
    .first<{
      id: string
      household_id: string
      user_id: string
      role: 'admin' | 'member'
    }>()

  if (!membership) {
    return null
  }

  return {
    householdId: membership.household_id,
    id: membership.id,
    role: membership.role,
    userId: membership.user_id,
  }
}

export const countActiveHouseholdMembers = async (
  db: D1Database,
  householdId: string,
): Promise<number> => {
  const row = await db
    .prepare(
      `SELECT COUNT(*) as count
         FROM household_memberships hm
         INNER JOIN households h ON h.id = hm.household_id
        WHERE hm.household_id = ?
          AND hm.state = 'active'
          AND h.archived_at IS NULL`,
    )
    .bind(householdId)
    .first<{ count: number }>()

  return row?.count ?? 0
}

export const listHouseholdMembers = async (
  db: D1Database,
  householdId: string,
): Promise<HouseholdMemberDTO[]> => {
  const results = await db
    .prepare(
      `SELECT u.id as user_id,
              u.display_name as name,
              COALESCE(u.primary_email, '') as email,
              hm.role,
              hm.joined_at as joinedAt
         FROM household_memberships hm
         INNER JOIN users u ON u.id = hm.user_id
         INNER JOIN households h ON h.id = hm.household_id
        WHERE hm.household_id = ?
          AND hm.state = 'active'
          AND h.archived_at IS NULL
        ORDER BY hm.joined_at ASC`,
    )
    .bind(householdId)
    .all<{
      user_id: string
      name: string
      email: string
      role: HouseholdRoleDTO
      joinedAt: number
    }>()

  return results.results.map((row) => ({
    userId: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role,
    joinedAt: row.joinedAt,
  }))
}

export const removeHouseholdMember = async (
  db: D1Database,
  householdId: string,
  userId: string,
): Promise<boolean> => {
  const result = await db
    .prepare(
      `UPDATE household_memberships
          SET state = 'removed',
              updated_at = ?
        WHERE household_id = ?
          AND user_id = ?
          AND state = 'active'`,
    )
    .bind(Date.now(), householdId, userId)
    .run()

  return Number(result.meta.changes ?? 0) === 1
}

export const leaveHousehold = async (
  db: D1Database,
  householdId: string,
  userId: string,
): Promise<boolean> => {
  const result = await db
    .prepare(
      `UPDATE household_memberships
          SET state = 'left',
              updated_at = ?
        WHERE household_id = ?
          AND user_id = ?
          AND state = 'active'`,
    )
    .bind(Date.now(), householdId, userId)
    .run()

  return Number(result.meta.changes ?? 0) === 1
}

export const countAdmins = async (
  db: D1Database,
  householdId: string,
): Promise<number> => {
  const row = await db
    .prepare(
      `SELECT COUNT(*) as count
         FROM household_memberships hm
        WHERE hm.household_id = ?
          AND hm.role = 'admin'
          AND hm.state = 'active'`,
    )
    .bind(householdId)
    .first<{ count: number }>()

  return row?.count ?? 0
}

export const findMembershipByUserAndHousehold = async (
  db: D1Database,
  householdId: string,
  userId: string,
): Promise<ResolvedHouseholdMembership | null> => {
  const membership = await db
    .prepare(
      `SELECT hm.id,
              hm.household_id,
              hm.user_id,
              hm.role
         FROM household_memberships hm
         INNER JOIN households h ON h.id = hm.household_id
        WHERE hm.household_id = ?
          AND hm.user_id = ?
          AND hm.state = 'active'
          AND h.archived_at IS NULL
        LIMIT 1`,
    )
    .bind(householdId, userId)
    .first<{
      id: string
      household_id: string
      user_id: string
      role: 'admin' | 'member'
    }>()

  if (!membership) {
    return null
  }

  return {
    householdId: membership.household_id,
    id: membership.id,
    role: membership.role,
    userId: membership.user_id,
  }
}
