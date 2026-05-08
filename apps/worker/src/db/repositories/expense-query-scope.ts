type VisibleExpenseScope = {
  conditions: string[]
  params: unknown[]
}

export const buildVisibleExpenseConditions = (
  userId: string,
  householdId?: string,
): VisibleExpenseScope => {
  const conditions: string[] = ['e.deleted_at IS NULL']
  const params: unknown[] = []

  if (householdId) {
    conditions.push('e.visibility = ?')
    params.push('household')
    conditions.push('e.household_id = ?')
    params.push(householdId)
  } else {
    conditions.push(`(
      (
        e.visibility = 'private'
        AND e.created_by_user_id = ?
      )
      OR (
        e.visibility = 'household'
        AND e.household_id IN (
          SELECT hm.household_id
            FROM household_memberships hm
           WHERE hm.user_id = ?
             AND hm.state = 'active'
        )
      )
    )`)

    params.push(userId, userId)
  }

  return { conditions, params }
}

export const buildPeriodWhereClause = (
  userId: string,
  householdId: string | undefined,
  periodStart: number,
  periodEnd: number,
) => {
  const { conditions, params } = buildVisibleExpenseConditions(
    userId,
    householdId,
  )

  conditions.push('e.occurred_at >= ?')
  params.push(periodStart)
  conditions.push('e.occurred_at < ?')
  params.push(periodEnd)

  return {
    whereClause: conditions.join(' AND '),
    params,
  }
}
