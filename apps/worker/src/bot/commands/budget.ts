import { findBudgetLimits } from '@/db/repositories/budget-limit-repository'
import {
  getBudgetSpendSummary,
  listAccessibleBudgets,
} from '@/db/repositories/budget-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'

import {
  type BudgetStatusLabel,
  formatPeriodLabel,
  getCurrentPeriod,
  renderBudgetLine,
  renderBudgetStatusText,
} from '../renderers/finance-text'
import { budgetKeyboard, openAppKeyboard } from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'

const calculateThresholdStatus = (
  actualMinor: number,
  plannedMinor: number,
): BudgetStatusLabel => {
  if (plannedMinor <= 0) {
    return 'ok'
  }

  const rawRatio = actualMinor / plannedMinor

  if (rawRatio >= 1) {
    return 'exceeded'
  }

  if (rawRatio >= 0.8) {
    return 'warning'
  }

  return 'ok'
}

/**
 * Resolve scope params for getBudgetSpendSummary from a budget record.
 * Returns null when the budget has an invalid/unexpected scope configuration
 * (e.g. personal budget without ownerUserId, household budget without householdId).
 */
const resolveSpendScope = (budget: {
  scope: string
  ownerUserId: string | null
  householdId: string | null
}): { ownerUserId: string } | { householdId: string } | null => {
  if (budget.scope === 'personal' && budget.ownerUserId) {
    return { ownerUserId: budget.ownerUserId }
  }

  if (budget.householdId) {
    return { householdId: budget.householdId }
  }

  return null
}

/**
 * Handle /budget command.
 *
 * Shows personal budget + all household budgets for the current month.
 * Unlinked users get Open App guidance.
 * Corrupted/malformed budget records are skipped with a warning line.
 */
export const handleBudgetCommand = async (
  ctx: CommandContext,
): Promise<BotResponse> => {
  const tmaUrl = ctx.telegramBotTmaUrl

  if (!ctx.appUserId) {
    return {
      text:
        'Vui lòng mở Mini App để đăng nhập và xem ngân sách.\n\n' +
        '🏠 <a href="' +
        tmaUrl +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(tmaUrl),
    }
  }

  const db = ctx.db
  const currentPeriod = getCurrentPeriod()
  const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId)
  const budgets = await listAccessibleBudgets(db, ctx.appUserId, householdIds)

  // Filter to current period only, not archived
  const currentBudgets = budgets.filter((b) => b.budgetMonth === currentPeriod)

  if (currentBudgets.length === 0) {
    return {
      text:
        '📋 <b>Ngân sách</b>\n\n' +
        `Chưa có ngân sách cho ${formatPeriodLabel(currentPeriod)}.`,
      parseMode: 'HTML',
    }
  }

  const lines: string[] = []

  for (const budget of currentBudgets) {
    const spendScope = resolveSpendScope(budget)

    if (!spendScope) {
      console.warn(
        `budget: skipped invalid scope budget=${budget.id} scope=${budget.scope}`,
      )

      lines.push(`⚠️ Ngân sách (${budget.scope}) không hợp lệ, đã bỏ qua.`)
      continue
    }

    const limits = await findBudgetLimits(db, budget.id)
    const categoryKeys = limits.flatMap((limit) =>
      limit.categoryKey ? [limit.categoryKey] : [],
    )

    const spendSummary =
      budget.startDate && budget.endDate
        ? await getBudgetSpendSummary(db, {
            ...spendScope,
            startDate: budget.startDate,
            endDate: budget.endDate,
            categoryKeys,
          })
        : {
            totalActualMinor: 0,
            categoryActualMinorByKey: {},
          }

    const status = calculateThresholdStatus(
      spendSummary.totalActualMinor,
      budget.totalLimitMinor,
    )

    let name: string

    if (budget.scope === 'personal') {
      name = 'Ngân sách cá nhân'
    } else {
      const household = budget.householdId
        ? await findHouseholdById(db, budget.householdId)
        : null

      name = household ? `Ngân sách ${household.name}` : 'Ngân sách hộ gia đình'
    }

    lines.push(
      renderBudgetLine(
        name,
        budget.totalLimitMinor,
        spendSummary.totalActualMinor,
        budget.currencyCode,
        status,
      ),
    )
  }

  if (lines.length === 0) {
    return {
      text:
        '📋 <b>Ngân sách</b>\n\n' +
        `Không có ngân sách hợp lệ cho ${formatPeriodLabel(currentPeriod)}.`,
      parseMode: 'HTML',
    }
  }

  return {
    text: renderBudgetStatusText(lines),
    parseMode: 'HTML',
    replyMarkup: budgetKeyboard(tmaUrl),
  }
}
