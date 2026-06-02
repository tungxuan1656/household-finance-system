import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type AuthBootstrapDeps,
  runAuthBootstrap,
} from '@/features/auth/bootstrap-deps'
import { useAuthStore } from '@/features/auth/store'
import type {
  AuthApiClient,
  ExchangeProviderResponse,
  RefreshSessionResponse,
} from '@/lib/auth/api'
import { AuthApiError } from '@/lib/auth/api'

const resetStore = () => {
  useAuthStore.getState().reset()
}

const buildSession = (
  overrides: Partial<ExchangeProviderResponse> = {},
): ExchangeProviderResponse => ({
  tokenType: 'Bearer',
  accessToken: 'access-1',
  accessTokenExpiresIn: 3600,
  refreshToken: 'refresh-1',
  refreshTokenExpiresIn: 86400,
  user: {
    id: 'user-1',
    email: null,
    displayName: 'Tung',
    avatarUrl: null,
    provider: 'telegram',
  },
  ...overrides,
})

const buildRefreshed = (
  overrides: Partial<RefreshSessionResponse> = {},
): RefreshSessionResponse => ({
  tokenType: 'Bearer',
  accessToken: 'access-2',
  accessTokenExpiresIn: 3600,
  refreshToken: 'refresh-2',
  refreshTokenExpiresIn: 86400,
  ...overrides,
})

const buildDeps = (
  overrides: Partial<AuthBootstrapDeps> = {},
): AuthBootstrapDeps => ({
  loadLaunchData: () => 'valid-init-data',
  loadRefreshToken: async () => null,
  setRefreshToken: async () => undefined,
  clearRefreshToken: async () => undefined,
  exchangeLaunchData: async () => buildSession(),
  refreshSession: async () => buildRefreshed(),
  ...overrides,
})

const buildApiClient = (
  overrides: Partial<AuthApiClient> = {},
): AuthApiClient => ({
  exchangeProviderToken: vi.fn(async () => buildSession()),
  refreshSession: vi.fn(async () => buildRefreshed()),
  logoutSession: vi.fn(async () => ({ revoked: true as const })),
  ...overrides,
})

describe('auth bootstrap order', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    resetStore()
  })

  it('authenticates when launch data and provider exchange succeed', async () => {
    const api = buildApiClient()
    const fatal = vi.fn()
    const setRefreshToken = vi.fn(async () => undefined)
    const onFatal = vi.fn()

    const result = await runAuthBootstrap(
      buildDeps({
        exchangeLaunchData: api.exchangeProviderToken as never,
        setRefreshToken: setRefreshToken as never,
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
    expect(state.error).toBeNull()
    expect(setRefreshToken).toHaveBeenCalledWith('refresh-1')
    expect(onFatal).not.toHaveBeenCalled()
    expect(fatal).not.toHaveBeenCalled()
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

  it('falls back to refresh when provider exchange fails and a refresh token is available', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(401, 'UNAUTHENTICATED')
    })
    const refresh = vi.fn(async () => buildRefreshed())
    const setRefreshToken = vi.fn(async () => undefined)
    const onFatal = vi.fn()

    const result = await runAuthBootstrap(
      buildDeps({
        exchangeLaunchData: exchange as never,
        loadRefreshToken: async () => 'stored-refresh',
        refreshSession: refresh as never,
        setRefreshToken: setRefreshToken as never,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('authenticated')
    expect(state.status).toBe('authenticated')
    expect(state.user).toBeNull()
    expect(state.accessToken).toBe('access-2')
    expect(state.refreshToken).toBe('refresh-2')
    expect(refresh).toHaveBeenCalledWith('stored-refresh')
    expect(setRefreshToken).toHaveBeenCalledWith('refresh-2')
    expect(onFatal).not.toHaveBeenCalled()
  })

  it('reports launchInvalid when exchange fails and no refresh token is stored', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(401, 'UNAUTHENTICATED')
    })
    const onFatal = vi.fn()

    const result = await runAuthBootstrap(
      buildDeps({
        exchangeLaunchData: exchange as never,
        loadRefreshToken: async () => null,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('launchInvalid')
    expect(onFatal).toHaveBeenCalledTimes(1)
  })

  it('reports sessionExpired and clears storage when refresh also fails', async () => {
    const exchange = vi.fn(async () => {
      throw new AuthApiError(401, 'UNAUTHENTICATED')
    })
    const refresh = vi.fn(async () => {
      throw new AuthApiError(401, 'UNAUTHENTICATED')
    })
    const clearRefreshToken = vi.fn(async () => undefined)
    const onFatal = vi.fn()

    const result = await runAuthBootstrap(
      buildDeps({
        exchangeLaunchData: exchange as never,
        loadRefreshToken: async () => 'stored-refresh',
        refreshSession: refresh as never,
        clearRefreshToken: clearRefreshToken as never,
        onFatal,
      }),
    )

    const state = useAuthStore.getState()
    expect(result).toBe('fatal')
    expect(state.status).toBe('error')
    expect(state.error?.code).toBe('sessionExpired')
    expect(clearRefreshToken).toHaveBeenCalledTimes(1)
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
})
