import {
  findBudgetLimits,
  getBudgetSpendSummary,
  listAccessibleBudgets,
} from '@/db/repositories/budget-repository'
import { getAnalyticsOverview } from '@/db/repositories/expense-analytics-repository'
import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import {
  formatPeriodLabel,
  getCurrentPeriod,
  toPeriodRange,
} from '@/lib/period'

import type { TelegramClient } from '../telegram-client'
import { renderWeeklyDigestText } from './renderers'
import { sendNotification } from './sender'

/**
 * Resolve budget spend scope params for digest.
 * Returns null for corrupt budgets — caller skips.
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
 * Get the week number and year for dedupe key.
 */
const getWeekKey = (): { week: number; year: number } => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const week = Math.ceil((diff / 86_400_000 + start.getDay() + 1) / 7)

  return { week, year: now.getFullYear() }
}

/**
 * Run weekly digest for all opted-in users.
 * Called from the weekly cron trigger.
 */
export const runWeeklyDigest = async (
  db: D1Database,
  telegramClient: TelegramClient,
  deepLinkUrl: string,
): Promise<void> => {
  const { week, year } = getWeekKey()
  const currentPeriod = getCurrentPeriod()
  const { start, end } = toPeriodRange(currentPeriod)
  const periodLabel = formatPeriodLabel(currentPeriod)

  // Get all linked telegram chat records
  const chatRows = await db
    .prepare(
      `SELECT telegram_user_id, user_id
         FROM telegram_bot_chats
        WHERE user_id IS NOT NULL`,
    )
    .all<{ telegram_user_id: string; user_id: string }>()

  for (const chat of chatRows.results) {
    const appUserId = chat.user_id
    const telegramUserId = chat.telegram_user_id

    try {
      const dedupeKey = `weekly_digest:${appUserId}:${week}:${year}`

      // Get personal overview (returns currencyCode on DTO — H1)
      const overview = await getAnalyticsOverview(db, {
        userId: appUserId,
        periodStart: start,
        periodEnd: end,
        period: currentPeriod,
      })

      const currencyCode = overview.currencyCode

      // Get budget warnings for the current period
      const householdIds = await listActiveHouseholdIdsForUser(db, appUserId)
      const budgets = await listAccessibleBudgets(db, appUserId, householdIds)
      const currentBudgets = budgets.filter(
        (b) => b.budgetMonth === currentPeriod,
      )

      const budgetWarnings: Array<{
        name: string
        status: 'warning' | 'exceeded'
        percent: number
      }> = []

      for (const budget of currentBudgets) {
        // Skip corrupt budgets (H3 fix)
        const spendScope = resolveSpendScope(budget)

        if (!spendScope) {
          console.warn(
            `weekly-digest: skipped corrupt budget id=${budget.id} scope=${budget.scope}`,
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

        let name: string
        if (budget.scope === 'personal') {
          name = 'Ngân sách cá nhân'
        } else {
          const hh = budget.householdId
            ? await findHouseholdById(db, budget.householdId)
            : null
          name = hh ? `Ngân sách ${hh.name}` : 'Ngân sách gia đình'
        }

        if (percent >= 80) {
          budgetWarnings.push({
            name,
            status: percent >= 100 ? 'exceeded' : 'warning',
            percent,
          })
        }
      }

      await sendNotification({
        db,
        telegramClient,
        telegramUserId,
        notificationType: 'weekly_digest',
        dedupeKey,
        text: renderWeeklyDigestText({
          totalSpendMinor: overview.totalSpendMinor,
          expenseCount: overview.expenseCount,
          topCategories: overview.topCategories,
          budgetWarnings,
          currencyCode,
          periodLabel,
          deepLinkUrl,
        }),
        parseMode: 'HTML',
        requiredPref: 'weekly_digest',
      })
    } catch (err) {
      console.error(
        `weekly-digest: error for user ${appUserId}`,
        (err as Error).message,
      )
    }
  }
}
