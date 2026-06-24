import { listActiveHouseholdIdsForUser } from '@/db/repositories/household-membership-repository'
import { findHouseholdById } from '@/db/repositories/household-repository'
import type { PreviewData } from '@/db/repositories/telegram-bot-expense-draft-repository'
import {
  findDraftById,
  upsertDraft,
} from '@/db/repositories/telegram-bot-expense-draft-repository'

import {
  renderExpensePreviewText,
  renderExpenseSummaryLine,
} from '../renderers/finance-text'
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
 * Both modes edit the originating message in place so the chat stays clean
 * (no extra "Chọn phạm vi" bubble stacked above the preview).
 * When the originating `messageId` is missing (e.g. unit tests), the dispatcher
 * falls back to `sendMessage` because `targetMessageId` is undefined.
 *
 * Verifies membership before setting household scope.
 */
export const handleHouseholdSelect = async (
  ctx: CommandContext,
  draftId: string,
  householdIdOrPersonal: string,
  messageId?: number,
): Promise<BotResponse> => {
  const tmaUrl = ctx.telegramBotTmaUrl

  if (!ctx.appUserId) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text:
        'Mở Mini App để đăng nhập.\n\n' +
        '🏠 <a href="' +
        tmaUrl +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: openAppKeyboard(tmaUrl),
    }
  }

  const db = ctx.db
  const draft = await findDraftById(db, draftId)

  if (!draft || draft.status !== 'pending') {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: 'Không tìm thấy hoặc đã hết hạn. Thử lại với /ai.',
      parseMode: 'HTML',
    }
  }

  // Mode 1: No payload — show household selection keyboard
  if (!householdIdOrPersonal) {
    let preview: PreviewData

    try {
      preview = JSON.parse(draft.previewJson) as PreviewData
    } catch {
      return {
        mode: 'edit',
        targetMessageId: messageId,
        text: 'Dữ liệu xem trước không hợp lệ.',
        parseMode: 'HTML',
      }
    }

    return buildHouseholdSelection(ctx, db, draft, preview, messageId)
  }

  // Mode 2: Apply selection
  let preview: PreviewData

  try {
    preview = JSON.parse(draft.previewJson) as PreviewData
  } catch {
    return {
      mode: 'edit',
      targetMessageId: messageId,
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
        mode: 'edit',
        targetMessageId: messageId,
        text: 'Không có quyền chọn hộ này.',
        parseMode: 'HTML',
      }
    }

    const household = await findHouseholdById(db, householdIdOrPersonal)
    if (!household) {
      return {
        mode: 'edit',
        targetMessageId: messageId,
        text: 'Không tìm thấy hộ.',
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
    mode: 'edit',
    targetMessageId: messageId,
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
 * Prepends a compact expense summary line so the user can still see
 * what expense they're picking scope for, then edits the originating
 * message in place so no extra bubble appears.
 */
const buildHouseholdSelection = async (
  ctx: CommandContext,
  db: D1Database,
  draft: { id: string },
  preview: PreviewData,
  messageId?: number,
): Promise<BotResponse> => {
  const householdIds = await listActiveHouseholdIdsForUser(db, ctx.appUserId!)

  const currencyCode =
    preview.scope === 'household' && preview.householdId
      ? ((await findHouseholdById(db, preview.householdId))
          ?.defaultCurrencyCode ?? 'VND')
      : 'VND'

  const summary = renderExpenseSummaryLine(preview, currencyCode)

  if (householdIds.length === 0) {
    return {
      mode: 'edit',
      targetMessageId: messageId,
      text: `${summary}\n\nChưa tham gia hộ nào. Sẽ thêm ở cá nhân.`,
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
    mode: 'edit',
    targetMessageId: messageId,
    text: `${summary}\n\nChọn phạm vi:`,
    parseMode: 'HTML',
    replyMarkup: householdSelectKeyboard(draft.id, households),
  }
}
