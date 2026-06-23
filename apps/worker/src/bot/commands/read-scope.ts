import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'

import {
  formatPeriodLabel,
  getCurrentPeriod,
  toPeriodRange,
} from '../renderers/finance-text'
import type { BotResponse, CommandContext } from '../types'

export interface ReadScopeData {
  /** Whether this is a household scope query. */
  isHousehold: boolean
  /** Resolved household id, set when isHousehold is true. */
  householdId?: string
  /** Household display name, set when isHousehold is true. */
  householdName?: string
  period: string
  periodStart: number
  periodEnd: number
  periodLabel: string
}

/**
 * Resolve the read-command scope from the command text.
 *
 * Usage:
 *  /cmd            — personal
 *  /cmd hh:<id>    — household by id
 *  /cmd household  — first accessible household
 *  /cmd home       — first accessible household
 *
 * On error (no households, inaccessible, not found) returns a BotResponse
 * that should be sent as-is. On success returns structured scope data.
 *
 * Unlinked check must be done by the caller before calling this helper.
 */
export const resolveReadScope = async (
  ctx: CommandContext,
): Promise<{ data: ReadScopeData } | { error: BotResponse }> => {
  const parts = ctx.text.split(/\s+/)
  const scopeArg = parts.length > 1 ? parts.slice(1).join(' ').trim() : ''
  const period = getCurrentPeriod()
  const { start, end } = toPeriodRange(period)
  const periodLabel = formatPeriodLabel(period)

  // Personal scope — default when no household arg
  if (
    !scopeArg.startsWith('hh:') &&
    scopeArg !== 'household' &&
    !scopeArg.startsWith('home')
  ) {
    return {
      data: {
        isHousehold: false,
        period,
        periodStart: start,
        periodEnd: end,
        periodLabel,
      },
    }
  }

  const db = ctx.db
  const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId!)

  if (householdIds.length === 0) {
    return {
      error: {
        text: 'Bạn chưa tham gia hộ gia đình nào.',
        parseMode: 'HTML',
      },
    }
  }

  const householdId = scopeArg.startsWith('hh:')
    ? scopeArg.slice(3).trim()
    : householdIds[0]

  if (!householdIds.includes(householdId)) {
    return {
      error: {
        text: 'Bạn không có quyền xem hộ gia đình này.',
        parseMode: 'HTML',
      },
    }
  }

  const household = await findHouseholdById(db, householdId)

  if (!household) {
    return {
      error: {
        text: 'Không tìm thấy hộ gia đình.',
        parseMode: 'HTML',
      },
    }
  }

  return {
    data: {
      isHousehold: true,
      householdId,
      householdName: household.name,
      period,
      periodStart: start,
      periodEnd: end,
      periodLabel,
    },
  }
}
