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
    conditions.push('e.household_id = ?')
    params.push(householdId)

    conditions.push(
      `EXISTS (
        SELECT 1
          FROM household_memberships hm
         WHERE hm.household_id = e.household_id
           AND hm.user_id = ?
           AND hm.state = 'active'
      )`,
    )

    params.push(userId)
  } else {
    conditions.push('e.created_by_user_id = ?')
    params.push(userId)
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
