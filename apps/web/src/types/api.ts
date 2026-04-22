export const API_ERROR_CODES = {
  CONFLICT: 'CONFLICT',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
} as const

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

export type ApiMetaDTO = {
  requestId: string
}

export type ApiErrorDTO = {
  code: ApiErrorCode
  message: string
  details?: unknown
}

export type ApiSuccessEnvelope<T> = {
  success: true
  data: T
  error: null
  meta: ApiMetaDTO
}

export type ApiErrorEnvelope = {
  success: false
  data: null
  error: ApiErrorDTO
  meta: ApiMetaDTO
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope
