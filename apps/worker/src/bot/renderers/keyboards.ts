import type { InlineKeyboardMarkup } from '../types'

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
 * Contextual keyboard for /budget — view details in Mini App.
 */
export const budgetKeyboard = (tmaUrl: string): InlineKeyboardMarkup => ({
  inline_keyboard: [[{ text: '💸 Xem chi tiết', web_app: { url: tmaUrl } }]],
})

/**
 * Expense preview keyboard.
 * Row 1: Confirm + Household, Row 2: Cancel.
 * Cancel edits the message in place to a "Đã huỷ" state with no buttons.
 * Retry was removed: user can simply send a new expense message instead.
 */
export const expensePreviewKeyboard = (
  draftId: string,
): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '✅ Thêm chi tiêu', callback_data: `confirm:${draftId}` },
      { text: '🏠 Chọn household', callback_data: `household:${draftId}` },
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
 * Tapping `🏠 Chọn household` shows the household picker; tapping
 * `🗑 Xoá` soft-deletes the expense and edits the same message in place.
 *
 * When the user has no households, the household button is hidden —
 * the delete button alone is enough for the 1-tap undo.
 *
 * Callback IDs:
 * - `ch_household:<expenseId>`  → show household picker for the expense
 * - `ch_delete:<expenseId>`    → soft-delete the expense
 */
export const postCreateKeyboard = (
  expenseId: string,
  hasHouseholds: boolean,
): InlineKeyboardMarkup => {
  const rows: Array<Array<{ text: string; callback_data: string }>> = []

  if (hasHouseholds) {
    rows.push([
      {
        text: '🏠 Chọn household',
        callback_data: `ch_household:${expenseId}`,
      },
    ])
  }

  rows.push([{ text: '🗑 Xoá', callback_data: `ch_delete:${expenseId}` }])

  return { inline_keyboard: rows }
}
