import { describe, expect, it, vi } from 'vitest'

import { createTmaAuthClient } from '@/lib/auth/client'

const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify({ data }), {
    headers: {
      'content-type': 'application/json',
    },
    status: 200,
  })

describe('TMA auth API client', () => {
  it('uses the worker auth base path exactly once for provider exchange', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        tokenType: 'Bearer' as const,
        accessToken: 'access-1',
        accessTokenExpiresIn: 3600,
        refreshToken: 'refresh-1',
        refreshTokenExpiresIn: 86_400,
        user: {
          id: 'user-1',
          email: null,
          displayName: 'Tung',
          avatarUrl: null,
          provider: 'telegram' as const,
        },
      }),
    )
    const client = createTmaAuthClient({ fetchImpl })

    await client.api.exchangeProviderToken({
      provider: 'telegram',
      initData: 'signed-init-data',
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/v1/auth/provider/exchange',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('uses the worker auth base path exactly once for refresh and logout', async () => {
    const fetchImpl = vi
      .fn(async () =>
        jsonResponse({
          tokenType: 'Bearer' as const,
          accessToken: 'access-2',
          accessTokenExpiresIn: 3600,
          refreshToken: 'refresh-2',
          refreshTokenExpiresIn: 86_400,
        }),
      )
      .mockImplementationOnce(async () =>
        jsonResponse({
          tokenType: 'Bearer' as const,
          accessToken: 'access-2',
          accessTokenExpiresIn: 3600,
          refreshToken: 'refresh-2',
          refreshTokenExpiresIn: 86_400,
        }),
      )
      .mockImplementationOnce(async () =>
        jsonResponse({ revoked: true as const }),
      )
    const client = createTmaAuthClient({ fetchImpl })

    await client.api.refreshSession('refresh-1')
    await client.api.logoutSession('refresh-2')

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      '/api/v1/auth/refresh',
      expect.objectContaining({ method: 'POST' }),
    )

    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      '/api/v1/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
