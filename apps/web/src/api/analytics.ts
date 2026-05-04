import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
} from '@/types/analytics'

export const getAnalyticsOverview = async (params: AnalyticsOverviewParams) => {
  const response = await client.get<AnalyticsOverviewDTO>(
    API_ENDPOINTS.analytics.overview,
    { params },
  )

  return response.data
}
