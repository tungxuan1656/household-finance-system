import type { BotResponse, CommandContext } from '../types'

/**
 * Handle /start command.
 *
 * Linked user: shows main menu with action buttons.
 * Unlinked user: shows Open App guidance only.
 */
export const handleStartCommand = (ctx: CommandContext): BotResponse => {
  const tmaUrl = ctx.telegramBotTmaUrl

  if (!ctx.appUserId) {
    return {
      text:
        'Xin chào! 👋\n\n' +
        'Vui lòng mở Mini App để bắt đầu sử dụng bot.\n\n' +
        '🏠 <a href="' +
        tmaUrl +
        '">Mở Mini App</a>',
      parseMode: 'HTML',
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: '🏠 Mở Mini App',
              web_app: { url: tmaUrl },
            },
          ],
        ],
      },
    }
  }

  const displayName = ctx.userDisplayName ?? 'bạn'

  return {
    text:
      'Chào ' +
      displayName +
      '! 🎉\n\n' +
      'Tôi là trợ lý chi tiêu của bạn. Chọn một hành động bên dưới:',
    parseMode: 'HTML',
    replyMarkup: {
      inline_keyboard: [
        [
          { text: '➕ Thêm chi tiêu', callback_data: 'add_expense' },
          { text: '📊 Xem thống kê', callback_data: 'stats' },
        ],
        [
          { text: '💸 Ngân sách', callback_data: 'budget' },
          { text: '⚙️ Cài đặt', callback_data: 'settings' },
        ],
        [{ text: '🏠 Mở Mini App', web_app: { url: tmaUrl } }],
      ],
    },
  }
}
