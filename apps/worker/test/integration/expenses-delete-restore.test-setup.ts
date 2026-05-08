import { SELF, env } from 'cloudflare:test'

import {
  type ApiEnvelope,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
} from '../helpers/test-context'

export {
  SELF,
  env,
  createExpense,
  createHousehold,
  exchangeAccessToken,
  parseJson,
}
export type { ApiEnvelope }

export const addMemberToHousehold = async (
  householdId: string,
  userId: string,
  role: 'admin' | 'member',
) => {
  const now = Date.now()

  await env.DB.prepare(
    `INSERT INTO household_memberships (
        id, household_id, user_id, role, state, joined_at, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
  )
    .bind(
      `hm-${householdId}-${userId}`,
      householdId,
      userId,
      role,
      now,
      now,
      now,
    )
    .run()
}
