import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import type { PreviewData } from '@/db/repositories/telegram-bot-expense-draft-repository'
import {
  findDraftById,
  upsertDraft,
} from '@/db/repositories/telegram-bot-expense-draft-repository'

import { renderExpensePreviewText } from '../renderers/finance-text'
import {
  expensePreviewKeyboard,
  householdSelectKeyboard,
  openAppKeyboard,
} from '../renderers/keyboards'
import type { BotResponse, CommandContext } from '../types'

/**
 * Handle a household select action.
 *
 * Two modes:
 * 1. `household:draftId` (payload empty) — show household selection keyboard
 * 2. `hhselect:draftId:personal|householdId` (payload set) — apply selection, re-render preview
 *
 * Verifies membership before setting household scope.
 */
export const handleHouseholdSelect = async (
  ctx: CommandContext,
  draftId: string,
  householdIdOrPersonal: string,
): Promise<BotResponse> => {
  if (!ctx.appUserId) {
    return {
      text:
        'Vui lòng mở Mini App để đăng nhập.\n\n' +
        '🏠 <a href="https://t.me/household_finance_bot/app">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(),
    }
  }

  const db = ctx.db
  const draft = await findDraftById(db, draftId)

  if (!draft || draft.status !== 'pending') {
    return {
      text: 'Không tìm thấy yêu cầu hoặc đã hết hạn. Vui lòng thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Mode 1: No payload — show household selection keyboard
  if (!householdIdOrPersonal) {
    return buildHouseholdSelection(ctx, db, draft)
  }

  // Mode 2: Apply selection
  let preview: PreviewData

  try {
    preview = JSON.parse(draft.previewJson) as PreviewData
  } catch {
    return {
      text: 'Dữ liệu xem trước không hợp lệ.',
      parseMode: 'HTML',
    }
  }

  if (householdIdOrPersonal === 'personal') {
    preview.scope = 'personal'
    preview.householdId = undefined
    preview.householdName = undefined
  } else {
    // Verify membership before setting household scope
    const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId)

    if (!householdIds.includes(householdIdOrPersonal)) {
      return {
        text: 'Bạn không có quyền chọn hộ gia đình này.',
        parseMode: 'HTML',
      }
    }

    const household = await findHouseholdById(db, householdIdOrPersonal)
    if (!household) {
      return {
        text: 'Không tìm thấy hộ gia đình.',
        parseMode: 'HTML',
      }
    }
    preview.scope = 'household'
    preview.householdId = household.id
    preview.householdName = household.name
  }

  // Update the draft with new preview
  await upsertDraft(db, {
    telegramUserId: draft.telegramUserId,
    telegramChatId: draft.telegramChatId,
    dedupeKey: draft.dedupeKey,
    previewJson: JSON.stringify(preview),
    locale: draft.locale,
  })

  return {
    text: renderExpensePreviewText(
      preview,
      preview.scope === 'household' && preview.householdId
        ? ((await findHouseholdById(db, preview.householdId))
            ?.defaultCurrencyCode ?? 'VND')
        : 'VND',
    ),
    parseMode: 'HTML',
    replyMarkup: expensePreviewKeyboard(draft.id),
  }
}

/**
 * Build a household selection message with inline keyboard.
 * Queries user's active households and renders the selection keyboard.
 */
const buildHouseholdSelection = async (
  ctx: CommandContext,
  db: D1Database,
  draft: { id: string },
): Promise<BotResponse> => {
  const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId!)

  if (householdIds.length === 0) {
    return {
      text: 'Bạn chưa tham gia hộ gia đình nào. Chi tiêu sẽ được thêm ở phạm vi cá nhân.',
      parseMode: 'HTML',
    }
  }

  const households: Array<{ id: string; name: string }> = []

  for (const hhId of householdIds) {
    const hh = await findHouseholdById(db, hhId)
    if (hh) {
      households.push({ id: hh.id, name: hh.name })
    }
  }

  return {
    text: 'Chọn phạm vi cho chi tiêu này:',
    parseMode: 'HTML',
    replyMarkup: householdSelectKeyboard(draft.id, households),
  }
}
