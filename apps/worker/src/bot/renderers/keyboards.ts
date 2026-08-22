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
 * Post-create keyboard — single delete button (undo).
 * Stacked per-expense when grouped; no household picker.
 */
export const postCreateKeyboard = (
  expenseId: string,
): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [{ text: '🗑 Xoá', callback_data: `ch_delete:${expenseId}` }],
  ],
})
