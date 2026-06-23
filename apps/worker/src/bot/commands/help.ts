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
      'Tôi có thể giúp bạn:\n' +
      '• Thêm chi tiêu nhanh bằng tin nhắn\n' +
      '• Xem thống kê chi tiêu\n' +
      '• Kiểm tra ngân sách\n' +
      '• Nhận thông báo ngân sách\n\n' +
      'Mọi thao tác phức tạp như xem biểu đồ, ' +
      'quản lý hộ gia đình, và cài đặt chi tiết ' +
      'đều có trong Mini App.\n\n' +
      '🏠 <a href="' +
      tmaUrl +
      '">Mở Mini App</a>\n\n' +
      '/start - Menu chính\n' +
      '/settings - Cài đặt thông báo\n' +
      '/help - Trợ giúp này',
    parseMode: 'HTML',
    replyMarkup: {
      inline_keyboard: [[{ text: '🏠 Mở Mini App', web_app: { url: tmaUrl } }]],
    },
  }
}
