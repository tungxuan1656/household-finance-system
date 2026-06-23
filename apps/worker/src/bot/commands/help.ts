import type { BotResponse, CommandContext } from '../types'

/**
 * Handle /help command.
 * Explains safe bot usage and when to open the TMA.
 */
export const handleHelpCommand = (ctx: CommandContext): BotResponse => {
  const tmaUrl = ctx.telegramBotTmaUrl

  return {
    text:
      '🤖 <b>Trợ lý Chi tiêu</b>\n\n' +
      '• Thêm chi tiêu (gửi thẳng hoặc /ai)\n' +
      '• Xem /stats, /top, /budget\n' +
      '• /settings cài đặt thông báo\n\n' +
      'Biểu đồ, gia đình, cài đặt chi tiết: mở Mini App.\n\n' +
      '🏠 <a href="' +
      tmaUrl +
      '">Mở Mini App</a>',
    parseMode: 'HTML',
    replyMarkup: {
      inline_keyboard: [[{ text: '🏠 Mở Mini App', web_app: { url: tmaUrl } }]],
    },
  }
}
