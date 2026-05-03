import { newId } from '@/utils/id'

export interface CreateAuditLogInput {
  householdId: string | null
  actorUserId: string | null
  actionType: string
  targetType: string
  targetId: string
  payloadJson: string
}

export const createAuditLogEntry = async (
  db: D1Database,
  input: CreateAuditLogInput,
): Promise<void> => {
  const nowEpoch = Date.now()

  await db
    .prepare(
      `INSERT INTO audit_logs (
        id,
        household_id,
        actor_user_id,
        action_type,
        target_type,
        target_id,
        payload_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      newId(),
      input.householdId,
      input.actorUserId,
      input.actionType,
      input.targetType,
      input.targetId,
      input.payloadJson,
      nowEpoch,
    )
    .run()
}
