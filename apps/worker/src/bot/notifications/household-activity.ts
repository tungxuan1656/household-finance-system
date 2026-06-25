import { listHouseholdMembers } from '@/db/repositories/household-membership-repository'
import { findTelegramBotChatByAppUserId } from '@/db/repositories/telegram-bot-chat-repository'

import type { TelegramClient } from '../telegram-client'
import { renderHouseholdActivityText } from './renderers'
import { sendNotification } from './sender'

export interface HouseholdActivityOptions {
  db: D1Database
  telegramClient: TelegramClient
  householdId: string
  expenseId: string
  actorUserId: string
  expenseTitle: string
  expenseAmountMinor: number
  expenseCategoryKey: string
  expenseOccurredAt: string
  expenseCurrencyCode: string
  householdName: string
}

/**
 * Send a household activity notification to all members (except the actor).
 * Called from create-expense.ts after a household expense is created.
 */
export const sendHouseholdActivity = async (
  options: HouseholdActivityOptions,
): Promise<void> => {
  const {
    db,
    telegramClient,
    householdId,
    expenseId,
    actorUserId,
    expenseTitle,
    expenseAmountMinor,
    expenseCategoryKey,
    expenseOccurredAt,
    expenseCurrencyCode,
    householdName,
  } = options

  // Get all active household members
  const members = await listHouseholdMembers(db, householdId)

  // Resolve actor name before the loop (B1 fix)
  const actor = members.find((m) => m.userId === actorUserId)
  const actorName = actor?.name || actorUserId

  for (const member of members) {
    // Skip the actor
    if (member.userId === actorUserId) continue

    // Find telegram chat by app user id (HIGH 4 — member.userId is app user id)
    const chat = await findTelegramBotChatByAppUserId(db, member.userId)

    if (!chat) continue

    // Send via sender with preference gating
    const activityTextOptions = {
      actorName,
      householdName,
      title: expenseTitle,
      amountMinor: expenseAmountMinor,
      categoryKey: expenseCategoryKey,
      occurredAt: expenseOccurredAt,
      currencyCode: expenseCurrencyCode,
    }

    await sendNotification({
      db,
      telegramClient,
      telegramUserId: chat.telegramUserId,
      notificationType: 'household_activity',
      dedupeKey: `household_activity:${householdId}:${expenseId}`,
      text: renderHouseholdActivityText(activityTextOptions),
      parseMode: 'HTML',
      requiredPref: 'household_activity',
    })
  }
}
