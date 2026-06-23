import { TMA_URL } from '../constants'
import type { InlineKeyboardMarkup } from '../types'

/**
 * Build a simple Open App inline keyboard.
 */
export const openAppKeyboard = (): InlineKeyboardMarkup => ({
  inline_keyboard: [[{ text: '🏠 Mở Mini App', web_app: { url: TMA_URL } }]],
})

/**
 * Build the expense preview action keyboard with confirm, household, retry, cancel buttons.
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
  _expenseId: string,
): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '➕ Thêm khoản khác', callback_data: 'add_another_expense' },
      { text: '🏠 Mở Mini App', web_app: { url: TMA_URL } },
    ],
  ],
})
