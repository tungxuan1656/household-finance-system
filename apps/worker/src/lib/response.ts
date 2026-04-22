import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import type { ErrorCode } from '@/lib/errors'
import { AppError, internalError } from '@/lib/errors'
import { defaultLocale, type SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export type ApiMeta = {
  requestId: string
}

export type ApiError = {
  code: ErrorCode
  message: string
  details?: unknown
}

export type ApiErrorEnvelope = {
  success: false
  data: null
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
  meta: ApiMeta
}

export type ApiSuccessEnvelope<T> = {
  success: true
  data: T
  error: null
  meta: ApiMeta
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope

const getRequestId = (ctx: Context<AppBindings>): string => {
  try {
    return ctx.get('requestId')
  } catch {
    return 'unknown-request'
  }
}

const getLocale = (ctx: Context<AppBindings>): SupportedLocale => {
  try {
    return ctx.get('locale')
  } catch {
    return defaultLocale
  }
}

export const success = <T>(
  ctx: Context<AppBindings>,
  data: T,
  status: ContentfulStatusCode = 200,
): Response => {
  const body: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    error: null,
    meta: {
      requestId: getRequestId(ctx),
    },
  }

  return ctx.json(body, status)
}

export const errorResponse = (
  ctx: Context<AppBindings>,
  error: AppError,
): Response => {
  const body: ApiErrorEnvelope = {
    success: false,
    data: null,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    meta: {
      requestId: getRequestId(ctx),
    },
  }

  return ctx.json(body, error.status as ContentfulStatusCode)
}

export const fromUnknownError = (
  ctx: Context<AppBindings>,
  error: unknown,
): Response => {
  if (error instanceof AppError) {
    return errorResponse(ctx, error)
  }

  console.error('Unhandled worker error', {
    requestId: getRequestId(ctx),
    error,
  })

  return errorResponse(ctx, internalError(getLocale(ctx)))
}
