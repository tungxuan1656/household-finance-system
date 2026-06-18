import { vi } from 'vitest'

import type { AuthBootstrapDeps } from '@/features/auth/bootstrap-deps'
import { useAuthStore } from '@/features/auth/store'
import type {
  AuthApiClient,
  ExchangeProviderResponse,
  RefreshSessionResponse,
} from '@/lib/auth/api'
import type { StoredSession } from '@/lib/storage/adapter'

export const resetStore = () => {
  useAuthStore.getState().reset()
}

export const buildSession = (
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

export const buildRefreshed = (
  overrides: Partial<RefreshSessionResponse> = {},
): RefreshSessionResponse => ({
  tokenType: 'Bearer',
  accessToken: 'access-2',
  accessTokenExpiresIn: 3600,
  refreshToken: 'refresh-2',
  refreshTokenExpiresIn: 86400,
  ...overrides,
})

export const buildStoredSession = (
  overrides: Partial<StoredSession> = {},
): StoredSession => ({
  telegramUserId: 111,
  user: {
    id: 'user-1',
    email: null,
    displayName: 'Tung',
    avatarUrl: null,
    provider: 'telegram',
  },
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  accessTokenExpiresAt: Date.now() + 3600_000,
  refreshTokenExpiresAt: Date.now() + 86400_000,
  ...overrides,
})

export const buildDeps = (
  overrides: Partial<AuthBootstrapDeps> = {},
): AuthBootstrapDeps => ({
  loadLaunchData: () => 'valid-init-data',
  loadTelegramUserId: () => 111,
  loadStoredSession: async () => null,
  persistSession: async () => undefined,
  clearStoredSession: async () => undefined,
  exchangeLaunchData: async () => buildSession(),
  refreshSession: async () => buildRefreshed(),
  ...overrides,
})

export const buildApiClient = (
  overrides: Partial<AuthApiClient> = {},
): AuthApiClient => ({
  exchangeProviderToken: vi.fn(async () => buildSession()),
  refreshSession: vi.fn(async () => buildRefreshed()),
  logoutSession: vi.fn(async () => ({ revoked: true as const })),
  ...overrides,
})
