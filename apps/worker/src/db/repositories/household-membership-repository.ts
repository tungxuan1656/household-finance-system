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
