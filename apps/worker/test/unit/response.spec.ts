import type { Context } from 'hono'
import { describe, expect, it, vi } from 'vitest'

import { invalidInput } from '@/lib/errors'
import {
  errorResponse,
  fromUnknownError,
  success,
  type ApiErrorEnvelope,
  type ApiSuccessEnvelope,
} from '@/lib/response'
import type { AppBindings } from '@/types'

const createContext = (): Context<AppBindings> =>
  ({
    get: (key: string) => {
      if (key === 'locale') {
        return 'vi'
      }

      if (key === 'requestId') {
        return 'request-123'
      }

      throw new Error('missing request context')
    },
    json: (body: unknown, status: number) =>
      new Response(JSON.stringify(body), {
        status,
        headers: {
          'content-type': 'application/json',
        },
      }),
  }) as unknown as Context<AppBindings>

describe('response helper', () => {
  it('returns the standard success envelope', async () => {
    const response = success(createContext(), { ok: true })
    const payload = (await response.json()) as ApiSuccessEnvelope<{ ok: boolean }>

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      success: true,
      data: { ok: true },
      error: null,
      meta: {
        requestId: 'request-123',
      },
    })
  })

  it('returns the standard error envelope for app errors', async () => {
    const response = errorResponse(
      createContext(),
      invalidInput('vi', 'errors.invalidRequestBody'),
    )
    const payload = (await response.json()) as ApiErrorEnvelope

    expect(response.status).toBe(400)
    expect(payload.success).toBe(false)
    expect(payload.data).toBeNull()
    expect(payload.error.code).toBe('INVALID_INPUT')
    expect(payload.meta.requestId).toBe('request-123')
  })

  it('maps unknown errors to a generic internal error response', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = fromUnknownError(
      createContext(),
      new Error('super-secret-token'),
    )
    const payload = (await response.json()) as ApiErrorEnvelope

    expect(response.status).toBe(500)
    expect(payload.success).toBe(false)
    expect(payload.data).toBeNull()
    expect(payload.error.code).toBe('INTERNAL_ERROR')
    expect(payload.error.message).toBe('Đã xảy ra lỗi nội bộ không mong muốn.')
    expect(payload.meta.requestId).toBe('request-123')
    expect(JSON.stringify(payload)).not.toContain('super-secret-token')

    consoleSpy.mockRestore()
  })
})
