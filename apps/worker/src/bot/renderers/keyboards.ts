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
 * Row 1: Confirm + Household, Row 2: Retry + Cancel.
 */
export const expensePreviewKeyboard = (
  draftId: string,
): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '✅ Thêm chi tiêu', callback_data: `confirm:${draftId}` },
      { text: '🏠 Chọn household', callback_data: `household:${draftId}` },
    ],
    [
      { text: '🔁 Nhập lại', callback_data: `retry:${draftId}` },
      { text: '❌ Hủy', callback_data: `cancel:${draftId}` },
    ],
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
 * Build the success keyboard after an expense is created.
 */
export const expenseCreatedKeyboard = (
  tmaUrl: string,
): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '📋 Xem chi tiết', web_app: { url: tmaUrl } },
      { text: '➕ Thêm khoản khác', callback_data: 'add_expense' },
    ],
  ],
})
