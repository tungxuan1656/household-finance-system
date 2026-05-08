import type { ReactNode } from 'react'
import { vi } from 'vitest'

export const useAnalyticsOverviewQueryMock = vi.fn()
export const useAnalyticsComparisonQueryMock = vi.fn()
export const useAnalyticsGroupsQueryMock = vi.fn()
export const exportAnalyticsCsvMock = vi.fn()
export const useReferenceCategoriesQueryMock = vi.fn()
export const fetchHouseholdsMock = vi.fn()

export const householdStoreState = {
  currentHousehold: { id: 'hh-1' } as { id: string } | null,
  households: [{ id: 'hh-1' }] as Array<{ id: string }>,
}

vi.mock('@/hooks/api/use-analytics', () => ({
  useAnalyticsOverviewQuery: (...args: unknown[]) =>
    useAnalyticsOverviewQueryMock(...args),
  useAnalyticsComparisonQuery: (...args: unknown[]) =>
    useAnalyticsComparisonQueryMock(...args),
  useAnalyticsGroupsQuery: (...args: unknown[]) =>
    useAnalyticsGroupsQueryMock(...args),
  exportAnalyticsCsv: (...args: unknown[]) => exportAnalyticsCsvMock(...args),
}))

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => useReferenceCategoriesQueryMock(),
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

vi.mock('@/stores/household.store', () => ({
  householdActions: { fetchHouseholds: () => fetchHouseholdsMock() },
  useHouseholdStore: {
    use: {
      currentHousehold: () => householdStoreState.currentHousehold,
      households: () => householdStoreState.households,
    },
  },
}))

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ height: 320, width: 640 }}>{children}</div>
    ),
  }
})

export function resetInsightsPageTestState(): void {
  fetchHouseholdsMock.mockReset()
  useAnalyticsOverviewQueryMock.mockReset()
  useAnalyticsComparisonQueryMock.mockReset()
  useAnalyticsGroupsQueryMock.mockReset()
  exportAnalyticsCsvMock.mockReset()
  householdStoreState.currentHousehold = { id: 'hh-1' }
  householdStoreState.households = [{ id: 'hh-1' }]

  useReferenceCategoriesQueryMock.mockReturnValue({
    data: {
      items: [
        { key: 'food', kind: 'expense', color: '#f00', iconUrl: '/food.svg' },
        {
          key: 'transport',
          kind: 'expense',
          color: '#0f0',
          iconUrl: '/transport.svg',
        },
      ],
    },
  })

  useAnalyticsComparisonQueryMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  })

  useAnalyticsGroupsQueryMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  })
}
