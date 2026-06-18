import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runAuthBootstrap } from '@/features/auth/bootstrap-deps'
import { useAuthStore } from '@/features/auth/store'
import { AuthApiError } from '@/lib/auth/api'
import type { StoredSession } from '@/lib/storage/adapter'

import {
  buildApiClient,
  buildDeps,
  buildRefreshed,
  buildSession,
  buildStoredSession,
  resetStore,
} from './auth-bootstrap-test-utils'

describe('auth bootstrap', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    resetStore()
  })

  // ── Exchange path (no usable cache) ──────────────────────────────────

  it('authenticates when launch data and provider exchange succeed', async () => {
    const api = buildApiClient()
    const persistSession = vi.fn(async (_session: StoredSession) => undefined)
    const onFatal = vi.fn()

    const result = await runAuthBootstrap(
      buildDeps({
        exchangeLaunchData: api.exchangeProviderToken as never,
        persistSession,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('authenticated')
    expect(state.status).toBe('authenticated')

    expect(state.user).toEqual({
      id: 'user-1',
      email: null,
      displayName: 'Tung',
      avatarUrl: null,
      provider: 'telegram',
    })

    expect(state.accessToken).toBe('access-1')
    expect(state.refreshToken).toBe('refresh-1')
    expect(state.telegramUserId).toBe(111)
    expect(state.error).toBeNull()
    expect(persistSession).toHaveBeenCalledTimes(1)
    expect(persistSession.mock.calls[0]![0].refreshToken).toBe('refresh-1')
    expect(onFatal).not.toHaveBeenCalled()
  })

  it('fails fast with launchInvalid when launch data is missing', async () => {
    const onFatal = vi.fn()
    const exchange = vi.fn(async () => buildSession())

    const result = await runAuthBootstrap(
      buildDeps({
        loadLaunchData: () => null,
        exchangeLaunchData: exchange as never,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('launchInvalid')
    expect(exchange).not.toHaveBeenCalled()
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  it('keeps the bootstrap as a stub when launch data is empty (intent-routing placeholder)', async () => {
    const onFatal = vi.fn()
    const exchange = vi.fn(async () => buildSession())

    const result = await runAuthBootstrap(
      buildDeps({
        loadLaunchData: () => '',
        exchangeLaunchData: exchange as never,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('launchInvalid')
    expect(exchange).not.toHaveBeenCalled()
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  it('reports launchInvalid when exchange rejects the launch and no refresh token is stored', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(401, 'UNAUTHENTICATED')
    })
    const onFatal = vi.fn()

    const result = await runAuthBootstrap(
      buildDeps({
        exchangeLaunchData: exchange as never,
        loadStoredSession: async () => null,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('launchInvalid')
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  it('reports networkError when bootstrap transport fails and no refresh token is stored', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(503, 'SERVICE_UNAVAILABLE')
    })
    const onFatal = vi.fn()

    const result = await runAuthBootstrap(
      buildDeps({
        exchangeLaunchData: exchange as never,
        loadStoredSession: async () => null,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('networkError')
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  // ── Restore path: access token still valid (0 API calls) ─────────────

  it('restores from SecureStorage without any API call when access token is still valid', async () => {
    const exchange = vi.fn(async () => buildSession())
    const refresh = vi.fn(async () => buildRefreshed())
    const persistSession = vi.fn(async () => undefined)
    const onFatal = vi.fn()

    const stored = buildStoredSession({
      accessTokenExpiresAt: Date.now() + 3600_000,
      refreshTokenExpiresAt: Date.now() + 86400_000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => 111,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
        persistSession,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('authenticated')
    expect(state.status).toBe('authenticated')
    expect(state.accessToken).toBe('access-1')
    expect(state.refreshToken).toBe('refresh-1')
    expect(state.telegramUserId).toBe(111)
    expect(state.accessTokenExpiresAt).toBe(stored.accessTokenExpiresAt)
    expect(state.refreshTokenExpiresAt).toBe(stored.refreshTokenExpiresAt)
    expect(exchange).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
    expect(persistSession).not.toHaveBeenCalled()
    expect(onFatal).not.toHaveBeenCalled()
  })

  // ── Restore path: access expired, refresh valid → refresh (1 API) ────

  it('refreshes when access token is expired but refresh token is still valid', async () => {
    const exchange = vi.fn(async () => buildSession())
    const refresh = vi.fn(async () => buildRefreshed())
    const persistSession = vi.fn(async (_session: StoredSession) => undefined)
    const onFatal = vi.fn()

    const stored = buildStoredSession({
      accessTokenExpiresAt: Date.now() - 1000,
      refreshTokenExpiresAt: Date.now() + 86400_000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => 111,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
        persistSession,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('authenticated')
    expect(state.status).toBe('authenticated')
    expect(state.accessToken).toBe('access-2')
    expect(state.refreshToken).toBe('refresh-2')
    expect(refresh).toHaveBeenCalledWith('refresh-1')
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(exchange).not.toHaveBeenCalled()
    expect(persistSession).toHaveBeenCalledTimes(1)
    expect(persistSession.mock.calls[0]![0].accessToken).toBe('access-2')
    expect(onFatal).not.toHaveBeenCalled()
  })

  // ── Cross-user guard: telegramUserId mismatch → exchange, never reuse ─

  it('forces exchange and never reuses stored refresh token when telegramUserId mismatches', async () => {
    const exchange = vi.fn(async () => buildSession())
    const refresh = vi.fn(async () => buildRefreshed())
    const onFatal = vi.fn()

    const stored = buildStoredSession({
      telegramUserId: 999,
      accessTokenExpiresAt: Date.now() + 3600_000,
      refreshTokenExpiresAt: Date.now() + 86400_000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => 111,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
        onFatal,
      }),
    )

    expect(result).toBe('authenticated')
    expect(exchange).toHaveBeenCalledTimes(1)
    expect(refresh).not.toHaveBeenCalled()
  })

  // ── Both expired → exchange ──────────────────────────────────────────

  it('falls through to exchange when both access and refresh tokens are expired', async () => {
    const exchange = vi.fn(async () => buildSession())
    const refresh = vi.fn(async () => buildRefreshed())

    const stored = buildStoredSession({
      accessTokenExpiresAt: Date.now() - 1000,
      refreshTokenExpiresAt: Date.now() - 1000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => 111,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
      }),
    )

    expect(result).toBe('authenticated')
    expect(exchange).toHaveBeenCalledTimes(1)
    expect(refresh).not.toHaveBeenCalled()
  })

  // ── Refresh fails → fall through to exchange ─────────────────────────

  it('falls through to exchange when restore refresh fails', async () => {
    const exchange = vi.fn(async () => buildSession())
    const refresh = vi.fn(async () => {
      throw new AuthApiError(401, 'UNAUTHENTICATED')
    })

    const stored = buildStoredSession({
      accessTokenExpiresAt: Date.now() - 1000,
      refreshTokenExpiresAt: Date.now() + 86400_000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => 111,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
      }),
    )

    expect(result).toBe('authenticated')
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(exchange).toHaveBeenCalledTimes(1)
  })

  // ── Exchange rejected (400/401) → fatal launchInvalid ───────────────

  it('reports launchInvalid when exchange rejects with 401 and both tokens are expired', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(401, 'UNAUTHENTICATED')
    })
    const refresh = vi.fn(async () => buildRefreshed())
    const onFatal = vi.fn()

    const stored = buildStoredSession({
      accessTokenExpiresAt: Date.now() - 1000,
      refreshTokenExpiresAt: Date.now() - 1000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => 111,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('launchInvalid')
    expect(refresh).not.toHaveBeenCalled()
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  it('does not reuse stored refresh token when exchange fails transiently and the stored user mismatches', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(503, 'SERVICE_UNAVAILABLE')
    })
    const refresh = vi.fn(async () => buildRefreshed())
    const onFatal = vi.fn()

    const stored = buildStoredSession({
      telegramUserId: 999,
      accessTokenExpiresAt: Date.now() + 3600_000,
      refreshTokenExpiresAt: Date.now() + 86400_000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => 111,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.error?.code).toBe('networkError')
    expect(refresh).not.toHaveBeenCalled()
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  // ── Restore refresh + exchange both fail transiently → fatal networkError ─

  it('reports networkError when restore refresh and exchange both fail transiently', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(503, 'SERVICE_UNAVAILABLE')
    })
    const refresh = vi.fn(async () => {
      throw new AuthApiError(503, 'SERVICE_UNAVAILABLE')
    })
    const clearStoredSession = vi.fn(async () => undefined)
    const onFatal = vi.fn()

    const stored = buildStoredSession({
      accessTokenExpiresAt: Date.now() - 1000,
      refreshTokenExpiresAt: Date.now() + 86400_000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => 111,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
        clearStoredSession,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('networkError')
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(exchange).toHaveBeenCalledTimes(1)
    expect(clearStoredSession).not.toHaveBeenCalled()
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  // ── Exchange unexpected client error → fatal sessionExpired ──────────

  it('reports sessionExpired when exchange fails with an unexpected client error', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(403, 'FORBIDDEN')
    })
    const clearStoredSession = vi.fn(async () => undefined)
    const onFatal = vi.fn()

    const result = await runAuthBootstrap(
      buildDeps({
        loadStoredSession: async () => null,
        exchangeLaunchData: exchange as never,
        clearStoredSession,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('sessionExpired')
    expect(clearStoredSession).not.toHaveBeenCalled()
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  // ─<arg_value> Dev mode: telegramUserId null → straight to exchange ───────────────

  it('skips restore and exchanges when telegramUserId is null (dev mode)', async () => {
    const exchange = vi.fn(async () => buildSession())
    const refresh = vi.fn(async () => buildRefreshed())

    const stored = buildStoredSession({
      accessTokenExpiresAt: Date.now() + 3600_000,
      refreshTokenExpiresAt: Date.now() + 86400_000,
    })

    const result = await runAuthBootstrap(
      buildDeps({
        loadTelegramUserId: () => null,
        loadStoredSession: async () => stored,
        exchangeLaunchData: exchange as never,
        refreshSession: refresh as never,
      }),
    )

    expect(result).toBe('authenticated')
    expect(exchange).toHaveBeenCalledTimes(1)
    expect(refresh).not.toHaveBeenCalled()
  })
})
