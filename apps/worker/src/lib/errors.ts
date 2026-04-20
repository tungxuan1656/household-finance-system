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

export const invalidInput = (message: string, details?: unknown): AppError =>
  new AppError(400, 'INVALID_INPUT', message, details)

export const unauthenticated = (
  message = 'Authentication is required.',
): AppError => new AppError(401, 'UNAUTHENTICATED', message)

export const forbidden = (
  message = 'You do not have permission to perform this action.',
): AppError => new AppError(403, 'FORBIDDEN', message)

export const notFound = (message = 'Resource not found.'): AppError =>
  new AppError(404, 'NOT_FOUND', message)

export const conflict = (message: string): AppError =>
  new AppError(409, 'CONFLICT', message)

export const internalError = (
  message = 'Unexpected internal error.',
): AppError => new AppError(500, 'INTERNAL_ERROR', message)
