import './overview-page.test-setup'

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OverviewPage } from '@/views/app/overview-page'

import {
  fetchHouseholdsMock,
  householdStoreState,
  resetOverviewPageTestState,
  useAnalyticsOverviewQueryMock,
  useBudgetListQueryMock,
  useExpenseSummaryQueryMock,
  useHouseholdMembersQueryMock,
} from './overview-page.test-setup'

describe('OverviewPage empty and loading', () => {
  beforeEach(() => {
    resetOverviewPageTestState()
  })

  it('shows onboarding-first empty state when user has no households', () => {
    render(<OverviewPage />)

    expect(screen.getByText('app.overview.empty.title')).toBeInTheDocument()

    expect(
      screen.getByText('app.overview.empty.description'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'app.overview.empty.createHousehold' }),
    ).toHaveAttribute('href', '/onboarding')

    expect(
      screen.getByRole('link', { name: 'app.overview.empty.joinHousehold' }),
    ).toHaveAttribute('href', '/onboarding')
  })

  it('loads households on mount and does not show empty state while initial household load is pending', () => {
    householdStoreState.isLoading = true

    render(<OverviewPage />)

    expect(fetchHouseholdsMock).toHaveBeenCalledTimes(1)

    expect(
      screen.queryByText('app.overview.empty.title'),
    ).not.toBeInTheDocument()

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  it('shows loading placeholders instead of misleading zero values', () => {
    householdStoreState.households = [
      {
        createdAt: 1,
        defaultCurrencyCode: 'VND',
        defaultVisibility: 'private',
        id: 'household-1',
        name: 'Gia đình Một',
        role: 'admin',
        slug: 'gia-dinh-mot',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    ]

    useHouseholdMembersQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    useAnalyticsOverviewQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    useBudgetListQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    useExpenseSummaryQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    render(<OverviewPage />)

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    expect(screen.queryByText('—')).not.toBeInTheDocument()
  })
})
