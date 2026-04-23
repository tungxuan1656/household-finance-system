import {
  defaultLocale,
  type MessageKey,
  type SupportedLocale,
  translate,
} from '@/lib/i18n'

export const ERROR_CODES = {
  CONFLICT: 'CONFLICT',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

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
  new AppError(
    400,
    ERROR_CODES.INVALID_INPUT,
    translate(locale, messageKey),
    details,
  )

export const unauthenticated = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.authenticationRequired',
): AppError =>
  new AppError(401, ERROR_CODES.UNAUTHENTICATED, translate(locale, messageKey))

export const forbidden = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.forbidden',
): AppError =>
  new AppError(403, ERROR_CODES.FORBIDDEN, translate(locale, messageKey))

export const notFound = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.resourceNotFound',
): AppError =>
  new AppError(404, ERROR_CODES.NOT_FOUND, translate(locale, messageKey))

export const conflict = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.conflict',
): AppError =>
  new AppError(409, ERROR_CODES.CONFLICT, translate(locale, messageKey))

export const internalError = (
  locale: SupportedLocale = defaultLocale,
  messageKey: MessageKey = 'errors.unexpectedInternalError',
): AppError =>
  new AppError(500, ERROR_CODES.INTERNAL_ERROR, translate(locale, messageKey))
