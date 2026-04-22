import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { AppError, internalError } from '@/lib/errors'
import { defaultLocale, type SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

type ApiErrorBody = {
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: {
    requestId: string
  }
}

type ApiSuccessBody<T> = {
  data: T
  meta: {
    requestId: string
  }
}

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
  const body: ApiSuccessBody<T> = {
    data,
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
  const body: ApiErrorBody = {
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
