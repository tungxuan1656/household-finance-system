import type { InlineKeyboardMarkup } from '../types'

const buildTmaRouteUrl = (tmaUrl: string, routePath: string): string => {
  const url = new URL(tmaUrl)
  const basePath = url.pathname.replace(/\/$/, '')

  url.pathname = `${basePath}${routePath}`

  return url.toString()
}

/**
 * Build a simple Open App inline keyboard.
 */
export const openAppKeyboard = (tmaUrl: string): InlineKeyboardMarkup => ({
  inline_keyboard: [[{ text: '🏠 Mở Mini App', web_app: { url: tmaUrl } }]],
})

/**
 * Contextual keyboard for /stats — open stats in Mini App.
 */
export const statsKeyboard = (tmaUrl: string): InlineKeyboardMarkup => ({
  inline_keyboard: [[{ text: '📊 Mở thống kê', web_app: { url: tmaUrl } }]],
})

/**
 * Contextual keyboard for /top — view transactions in Mini App.
 */
export const topKeyboard = (tmaUrl: string): InlineKeyboardMarkup => ({
  inline_keyboard: [[{ text: '📋 Xem giao dịch', web_app: { url: tmaUrl } }]],
})

/**
 * Contextual keyboard for /recents — open expense list in Mini App.
 */
export const recentsKeyboard = (tmaUrl: string): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      {
        text: '📋 Xem tất cả',
        web_app: { url: buildTmaRouteUrl(tmaUrl, '/expenses') },
      },
    ],
  ],
})

/**
 * Contextual keyboard for /budget — view details in Mini App.
 */
export const budgetKeyboard = (tmaUrl: string): InlineKeyboardMarkup => ({
  inline_keyboard: [[{ text: '💸 Xem chi tiết', web_app: { url: tmaUrl } }]],
})

/**
 * Expense preview keyboard.
 * Row 1: Confirm + Gia đình, Row 2: Cancel.
 * Cancel edits the message in place to a "Đã huỷ" state with no buttons.
 * Retry was removed: user can simply send a new expense message instead.
 */
export const expensePreviewKeyboard = (
  draftId: string,
): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '✅ Thêm chi tiêu', callback_data: `confirm:${draftId}` },
      { text: '🏠 Chọn gia đình', callback_data: `household:${draftId}` },
    ],
    [{ text: '❌ Hủy', callback_data: `cancel:${draftId}` }],
  ],
})

/**
 * Build household selection keyboard for a draft.
 */
export const householdSelectKeyboard = (
  draftId: string,
  households: Array<{ id: string; name: string }>,
): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [{ text: '👤 Cá nhân', callback_data: `hhselect:${draftId}:personal` }],
    ...households.map((h) => [
      { text: `🏠 ${h.name}`, callback_data: `hhselect:${draftId}:${h.id}` },
    ]),
  ],
})

/**
 * Post-create keyboard for natural-input direct-create expenses.
 * Replaces the preview keyboard after a natural-input expense is saved.
 * Tapping `🏠 Chọn gia đình` shows the household picker so the user can
 * reassign a freshly-created personal expense to a household.
 *
 * The `🗑 Xoá` 1-tap undo was removed: users now delete expenses from the
 * Mini App / web client, not via the bot. The `ch_delete` callback and
 * `handlePostCreateDelete` are still wired so that pre-existing messages
 * sent before this change remain functional (Telegram keeps inline
 * buttons on already-sent messages).
 *
 * The `showHouseholdButton` flag is decided by the caller:
 * - First-time create (personal): show if the user belongs to ≥1 household
 * - Apply personal: show if the user belongs to ≥1 household
 * - Apply household: hide (already in a household; tapping again would
 *   only switch, and the picker is no longer relevant)
 *
 * Callback ID:
 * - `ch_household:<expenseId>`  → show household picker for the expense
 */
export const postCreateKeyboard = (
  expenseId: string,
  showHouseholdButton: boolean,
): InlineKeyboardMarkup => {
  const rows: Array<Array<{ text: string; callback_data: string }>> = []

  if (showHouseholdButton) {
    rows.push([
      {
        text: '🏠 Chọn gia đình',
        callback_data: `ch_household:${expenseId}`,
      },
    ])
  }

  return { inline_keyboard: rows }
}
