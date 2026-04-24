import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  ExchangeProviderRequest,
  ExchangeProviderResponse,
  LogoutSessionResponse,
} from '@/types/auth'

export const exchangeProviderToken = async (
  payload: ExchangeProviderRequest,
) => {
  const response = await client.post<ExchangeProviderResponse>(
    API_ENDPOINTS.auth.exchange,
    payload,
    {
      skipAuth: true,
    },
  )

  return response.data
}

export const logoutSession = async () => {
  const response = await client.post<LogoutSessionResponse>(
    API_ENDPOINTS.auth.logout,
  )

  return response.data
}
