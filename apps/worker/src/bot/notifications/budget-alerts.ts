import {
  findBudgetLimits,
  getBudgetSpendSummary,
  listAccessibleBudgets,
} from '@/db/repositories/budget-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import { getCurrentPeriod } from '@/lib/period'

import type { TelegramClient } from '../telegram-client'
import { budgetAlertKeyboard, renderBudgetAlertText } from './renderers'
import { sendNotification } from './sender'

/**
 * Resolve budget spend scope params.
 * Returns null for corrupt budgets (not personal with ownerUserId,
 * no householdId) — caller skips instead of querying with empty ownerUserId.
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
 * Run budget alert checks for all linked users.
 * Called from the daily cron trigger.
 * Sends budget_warning (80%) and budget_exceeded (100%) alerts.
 */
export const runBudgetAlerts = async (
  db: D1Database,
  telegramClient: TelegramClient,
  tmaUrl: string,
): Promise<void> => {
  const currentPeriod = getCurrentPeriod()

  // Query all linked chat records with app user ids
  const chatRows = await db
    .prepare(
      `SELECT DISTINCT tbc.telegram_user_id, tbc.user_id
         FROM telegram_bot_chats tbc
        WHERE tbc.user_id IS NOT NULL`,
    )
    .all<{ telegram_user_id: string; user_id: string }>()

  for (const chat of chatRows.results) {
    const appUserId = chat.user_id
    const telegramUserId = chat.telegram_user_id

    try {
      const householdIds = await listActiveHouseholdIdsForUser(db, appUserId)
      const budgets = await listAccessibleBudgets(db, appUserId, householdIds)
      const currentBudgets = budgets.filter(
        (b) => b.budgetMonth === currentPeriod,
      )

      for (const budget of currentBudgets) {
        // Skip corrupt budgets (H3 fix)
        const spendScope = resolveSpendScope(budget)

        if (!spendScope) {
          console.warn(
            `budget-alerts: skipped corrupt budget id=${budget.id} scope=${budget.scope}`,
          )

          continue
        }

        const limits = await findBudgetLimits(db, budget.id)
        const categoryKeys = limits.flatMap((l) =>
          l.categoryKey ? [l.categoryKey] : [],
        )

        const spendSummary =
          budget.startDate && budget.endDate
            ? await getBudgetSpendSummary(db, {
                ...spendScope,
                startDate: budget.startDate,
                endDate: budget.endDate,
                categoryKeys,
              })
            : { totalActualMinor: 0, categoryActualMinorByKey: {} }

        if (budget.totalLimitMinor <= 0) continue

        const percent = Math.round(
          (spendSummary.totalActualMinor / budget.totalLimitMinor) * 100,
        )

        // Determine budget name
        let name: string
        if (budget.scope === 'personal') {
          name = 'Ngân sách cá nhân'
        } else {
          const hh = budget.householdId
            ? await findHouseholdById(db, budget.householdId)
            : null
          name = hh ? `Ngân sách ${hh.name}` : 'Ngân sách gia đình'
        }

        // Warning at 80%
        if (percent >= 80 && percent < 100) {
          await sendNotification({
            db,
            telegramClient,
            telegramUserId,
            notificationType: 'budget_warning',
            dedupeKey: `budget:${budget.id}:${appUserId}:${currentPeriod}:warning`,
            text: renderBudgetAlertText({
              name,
              totalPlannedMinor: budget.totalLimitMinor,
              totalActualMinor: spendSummary.totalActualMinor,
              currencyCode: budget.currencyCode,
              isExceeded: false,
            }),
            parseMode: 'HTML',
            replyMarkup: budgetAlertKeyboard(tmaUrl),
            requiredPref: 'budget_alerts',
          })
        }

        // Exceeded at 100%
        if (percent >= 100) {
          await sendNotification({
            db,
            telegramClient,
            telegramUserId,
            notificationType: 'budget_exceeded',
            dedupeKey: `budget:${budget.id}:${appUserId}:${currentPeriod}:exceeded`,
            text: renderBudgetAlertText({
              name,
              totalPlannedMinor: budget.totalLimitMinor,
              totalActualMinor: spendSummary.totalActualMinor,
              currencyCode: budget.currencyCode,
              isExceeded: true,
            }),
            parseMode: 'HTML',
            replyMarkup: budgetAlertKeyboard(tmaUrl),
            requiredPref: 'budget_alerts',
          })
        }
      }
    } catch (err) {
      console.error(
        `budget-alerts: error processing user ${appUserId}`,
        (err as Error).message,
      )
    }
  }
}
