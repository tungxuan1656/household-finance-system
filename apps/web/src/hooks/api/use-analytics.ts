import { useQuery } from '@tanstack/react-query'

import {
  getAnalyticsComparison,
  getAnalyticsExport,
  getAnalyticsGroups,
  getAnalyticsOverview,
} from '@/api/analytics'
import type {
  AnalyticsComparisonDTO,
  AnalyticsComparisonParams,
  AnalyticsExportParams,
  AnalyticsGroupsDTO,
  AnalyticsGroupsParams,
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
} from '@/types/analytics'

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  overview: (params: AnalyticsOverviewParams) =>
    [...ANALYTICS_KEYS.all, 'overview', params] as const,
  comparison: (params: AnalyticsComparisonParams) =>
    [...ANALYTICS_KEYS.all, 'comparison', params] as const,
  groups: (params: AnalyticsGroupsParams) =>
    [...ANALYTICS_KEYS.all, 'groups', params] as const,
  export: (params: AnalyticsExportParams) =>
    [...ANALYTICS_KEYS.all, 'export', params] as const,
}

type UseAnalyticsOverviewQueryOptions = {
  enabled?: boolean
}

type UseAnalyticsComparisonQueryOptions = {
  enabled?: boolean
}

type UseAnalyticsGroupsQueryOptions = {
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

export const useAnalyticsComparisonQuery = (
  params: AnalyticsComparisonParams,
  options?: UseAnalyticsComparisonQueryOptions,
) =>
  useQuery<AnalyticsComparisonDTO, Error>({
    queryKey: ANALYTICS_KEYS.comparison(params),
    queryFn: () => getAnalyticsComparison(params),
    enabled: options?.enabled,
  })

export const useAnalyticsGroupsQuery = (
  params: AnalyticsGroupsParams,
  options?: UseAnalyticsGroupsQueryOptions,
) =>
  useQuery<AnalyticsGroupsDTO, Error>({
    queryKey: ANALYTICS_KEYS.groups(params),
    queryFn: () => getAnalyticsGroups(params),
    enabled: options?.enabled,
  })

export const exportAnalyticsCsv = (params: AnalyticsExportParams) =>
  getAnalyticsExport(params)
