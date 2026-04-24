import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  ExchangeProviderRequest,
  ExchangeProviderResponse,
  LogoutSessionResponse,
  RefreshSessionRequest,
  RefreshSessionResponse,
} from '@/types/auth'

export const exchangeProviderToken = async (
  payload: ExchangeProviderRequest,
) => {
  const response = await client.post<ExchangeProviderResponse>(
    API_ENDPOINTS.auth.exchange,
    payload,
    {
      skipAuth: true,
      skipAuthRefresh: true,
    },
  )

  return response.data
}

export const refreshSession = async (payload: RefreshSessionRequest) => {
  const response = await client.post<RefreshSessionResponse>(
    API_ENDPOINTS.auth.refresh,
    payload,
    {
      skipAuth: true,
      skipAuthRefresh: true,
    },
  )

  return response.data
}

export const logoutSession = async () => {
  const response = await client.post<LogoutSessionResponse>(
    API_ENDPOINTS.auth.logout,
    {},
    {
      skipAuth: true,
      skipAuthRefresh: true,
    },
  )

  return response.data
}
