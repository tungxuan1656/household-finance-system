import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  AnalyticsComparisonDTO,
  AnalyticsComparisonParams,
  AnalyticsGroupsDTO,
  AnalyticsGroupsParams,
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

export const getAnalyticsComparison = async (
  params: AnalyticsComparisonParams,
) => {
  const response = await client.get<AnalyticsComparisonDTO>(
    API_ENDPOINTS.analytics.comparison,
    { params },
  )

  return response.data
}

export const getAnalyticsGroups = async (params: AnalyticsGroupsParams) => {
  const response = await client.get<AnalyticsGroupsDTO>(
    API_ENDPOINTS.analytics.groups,
    { params },
  )

  return response.data
}
