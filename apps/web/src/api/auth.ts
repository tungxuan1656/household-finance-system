import { client, type createApiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  ExchangeProviderRequest,
  ExchangeProviderResponse,
  LogoutSessionResponse,
  RefreshSessionRequest,
  RefreshSessionResponse,
} from '@/types/auth'

export const exchangeProviderToken = (payload: ExchangeProviderRequest) =>
  client.post<ExchangeProviderResponse>(API_ENDPOINTS.auth.exchange, payload, {
    skipAuth: true,
    skipAuthRefresh: true,
  })

export const refreshSession = (payload: RefreshSessionRequest) =>
  client.post<RefreshSessionResponse>(API_ENDPOINTS.auth.refresh, payload, {
    skipAuth: true,
    skipAuthRefresh: true,
  })

export const logoutSession = (
  authenticatedClient: Pick<ReturnType<typeof createApiClient>, 'post'>,
) =>
  authenticatedClient.post<LogoutSessionResponse>(API_ENDPOINTS.auth.logout, {})
