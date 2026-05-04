import { useQuery } from '@tanstack/react-query'

import { getAnalyticsOverview } from '@/api/analytics'
import type {
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
} from '@/types/analytics'

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  overview: (params: AnalyticsOverviewParams) =>
    [...ANALYTICS_KEYS.all, 'overview', params] as const,
}

type UseAnalyticsOverviewQueryOptions = {
  enabled?: boolean
}

export const useAnalyticsOverviewQuery = (
  params: AnalyticsOverviewParams,
  options?: UseAnalyticsOverviewQueryOptions,
) =>
  useQuery<AnalyticsOverviewDTO, Error>({
    queryKey: ANALYTICS_KEYS.overview(params),
    queryFn: () => getAnalyticsOverview(params),
    enabled: options?.enabled,
  })
