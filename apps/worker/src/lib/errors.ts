import {
  defaultLocale,
  type MessageKey,
  type SupportedLocale,
  translate,
} from '@/lib/i18n'

export type ErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  public readonly status: number
  public readonly code: ErrorCode
  public readonly details?: unknown

  public constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const invalidInput = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.invalidRequestBody',
  details?: unknown,
): AppError =>
  new AppError(400, 'INVALID_INPUT', translate(locale, messageKey), details)

export const unauthenticated = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.authenticationRequired',
): AppError =>
  new AppError(401, 'UNAUTHENTICATED', translate(locale, messageKey))

export const forbidden = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.forbidden',
): AppError => new AppError(403, 'FORBIDDEN', translate(locale, messageKey))

export const notFound = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.resourceNotFound',
): AppError => new AppError(404, 'NOT_FOUND', translate(locale, messageKey))

export const conflict = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.conflict',
): AppError => new AppError(409, 'CONFLICT', translate(locale, messageKey))

export const internalError = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.unexpectedInternalError',
): AppError =>
  new AppError(500, 'INTERNAL_ERROR', translate(locale, messageKey))
