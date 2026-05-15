import { newId } from '@/utils/id'

export const findGroupIdsForExpense = async (
  db: D1Database,
  expenseId: string,
): Promise<string[]> => {
  const rows = await db
    .prepare(
      `SELECT group_id
         FROM expense_group_items
        WHERE expense_id = ?`,
    )
    .bind(expenseId)
    .all<{ group_id: string }>()

  return rows.results.map((row) => row.group_id)
}

export const findGroupIdsForExpenses = async (
  db: D1Database,
  expenseIds: string[],
): Promise<Map<string, string[]>> => {
  if (expenseIds.length === 0) {
    return new Map()
  }

  const placeholders = expenseIds.map(() => '?').join(',')
  const rows = await db
    .prepare(
      `SELECT expense_id, group_id
         FROM expense_group_items
        WHERE expense_id IN (${placeholders})`,
    )
    .bind(...expenseIds)
    .all<{ expense_id: string; group_id: string }>()

  const map = new Map<string, string[]>()
  for (const row of rows.results) {
    const groupIds = map.get(row.expense_id) ?? []
    groupIds.push(row.group_id)
    map.set(row.expense_id, groupIds)
  }

  return map
}

export const replaceExpenseGroupAssignments = async (
  db: D1Database,
  expenseId: string,
  groupIds: string[],
  assignedByUserId: string,
): Promise<void> => {
  const statements: D1PreparedStatement[] = []

  statements.push(
    db
      .prepare(
        `DELETE FROM expense_group_items
          WHERE expense_id = ?`,
      )
      .bind(expenseId),
  )

  const now = Date.now()
  for (const groupId of groupIds) {
    statements.push(
      db
        .prepare(
          `INSERT INTO expense_group_items (
            id, household_id, expense_id, group_id, assigned_by_user_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(newId(), null, expenseId, groupId, assignedByUserId, now),
    )
  }

  await db.batch(statements)
}
