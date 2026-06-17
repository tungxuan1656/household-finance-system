import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'

import { get } from '@/lib/api/client'

import type {
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
  HouseholdDTO,
} from '../types'

// ---------------------------------------------------------------------------
// Helper types & utilities
// ---------------------------------------------------------------------------

export type AnalyticsOverviewScopeParams =
  | { period: string }
  | {
      date_from: number
      date_to: number
    }

export const withHouseholdAnalyticsParams = (
  householdId: string,
  params: AnalyticsOverviewScopeParams,
): AnalyticsOverviewParams =>
  'period' in params
    ? { household_id: householdId, period: params.period }
    : {
        household_id: householdId,
        date_from: params.date_from,
        date_to: params.date_to,
      }

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

const getAnalyticsOverview = (params: AnalyticsOverviewParams) =>
  get<AnalyticsOverviewDTO>('/analytics/overview', { params })

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  overview: (params: AnalyticsOverviewParams) =>
    [...ANALYTICS_KEYS.all, 'overview', params] as const,
}

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export const analyticsOverviewQueryOptions = (
  params: AnalyticsOverviewParams,
) =>
  queryOptions({
    queryKey: ANALYTICS_KEYS.overview(params),
    queryFn: () => getAnalyticsOverview(params),
  })

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export const useHouseholdOverviewQuery = (
  householdId: string | undefined,
  params: AnalyticsOverviewScopeParams,
) =>
  useQuery({
    ...analyticsOverviewQueryOptions(
      householdId ? withHouseholdAnalyticsParams(householdId, params) : params,
    ),
    enabled: Boolean(householdId),
  })

export const useHouseholdOverviewQueries = (
  households: HouseholdDTO[],
  params: AnalyticsOverviewScopeParams,
) =>
  useQueries({
    queries: households.map((household) =>
      analyticsOverviewQueryOptions(
        withHouseholdAnalyticsParams(household.id, params),
      ),
    ),
  })
