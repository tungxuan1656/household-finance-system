import { logger, truncateErrorMessage } from '@/lib/logger'

import type { TelegramClient } from '../telegram-client'

const isRetriableEditError = (err: unknown): boolean => {
  if (err instanceof DOMException && err.name === 'AbortError') return true

  const m = err instanceof Error ? err.message : String(err)
  const l = m.toLowerCase()
  if (
    m.includes('429') ||
    m.includes('500') ||
    m.includes('502') ||
    m.includes('503') ||
    m.includes('504')
  )
    return true
  if (
    l.includes('timeout') ||
    l.includes('network') ||
    l.includes('timed out') ||
    l.includes('aborted')
  )
    return true
  if (
    m.includes('400') ||
    l.includes('bad request') ||
    l.includes('message is not modified') ||
    l.includes('message to edit not found') ||
    l.includes("can't be edited")
  )
    return false

  return !m.includes('400')
}
export const createSafeEdit =
  (client: TelegramClient, correlationId: string) =>
  async (
    chatId: number | string,
    msgId: number,
    editText: string,
  ): Promise<void> => {
    try {
      await client.editMessageText(chatId, msgId, editText, {
        parseMode: 'HTML',
      })

      return
    } catch (firstError) {
      logger.error(
        correlationId,
        'bot_natural_expense_safe_edit_first_failed',
        {
          chatId,
          msgId,
          errorName:
            firstError instanceof Error ? firstError.name : 'UnknownError',
          errorMessage:
            firstError instanceof Error
              ? truncateErrorMessage(firstError.message)
              : truncateErrorMessage(String(firstError)),
        },
      )

      // Only retry retriable; 400 Bad Request → fallback immediately to avoid duplicate
      if (!isRetriableEditError(firstError)) {
        try {
          await client.sendMessage(chatId, editText, { parseMode: 'HTML' })
        } catch (sendError) {
          logger.error(
            correlationId,
            'bot_natural_expense_safe_edit_fallback_send_failed',
            {
              chatId,
              errorName:
                sendError instanceof Error ? sendError.name : 'UnknownError',
              errorMessage:
                sendError instanceof Error
                  ? truncateErrorMessage(sendError.message)
                  : truncateErrorMessage(String(sendError)),
            },
          )
        }

        return
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      try {
        await client.editMessageText(chatId, msgId, editText, {
          parseMode: 'HTML',
        })

        return
      } catch (secondError) {
        logger.error(
          correlationId,
          'bot_natural_expense_safe_edit_retry_failed',
          {
            chatId,
            msgId,
            errorName:
              secondError instanceof Error ? secondError.name : 'UnknownError',
            errorMessage:
              secondError instanceof Error
                ? truncateErrorMessage(secondError.message)
                : truncateErrorMessage(String(secondError)),
          },
        )

        try {
          await client.sendMessage(chatId, editText, { parseMode: 'HTML' })
        } catch (sendError) {
          logger.error(
            correlationId,
            'bot_natural_expense_safe_edit_fallback_send_failed',
            {
              chatId,
              errorName:
                sendError instanceof Error ? sendError.name : 'UnknownError',
              errorMessage:
                sendError instanceof Error
                  ? truncateErrorMessage(sendError.message)
                  : truncateErrorMessage(String(sendError)),
            },
          )
        }
      }
    }
  }
