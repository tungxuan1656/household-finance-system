import type { Context } from 'hono'
import { describe, expect, it, vi } from 'vitest'

import type { AppBindings } from '@/dto'
import { fromUnknownError } from '@/lib/response'

const createContext = (): Context<AppBindings> =>
  ({
    get: () => {
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
  it('maps unknown errors to a generic internal error response', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = fromUnknownError(
      createContext(),
      new Error('super-secret-token'),
    )
    const payload = (await response.json()) as {
      error: { code: string; message: string }
      meta: { requestId: string }
    }

    expect(response.status).toBe(500)
    expect(payload.error.code).toBe('INTERNAL_ERROR')
    expect(payload.error.message).toBe('Unexpected internal error.')
    expect(payload.meta.requestId).toBe('unknown-request')
    expect(JSON.stringify(payload)).not.toContain('super-secret-token')

    consoleSpy.mockRestore()
  })
})
