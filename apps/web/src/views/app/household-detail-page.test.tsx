import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { t } from '@/lib/i18n/t'
import { HouseholdDetailPage } from '@/views/app/household-detail-page'

const replaceMock = vi.fn()
const fetchHouseholdByIdMock = vi.fn(
  async (_householdId: string): Promise<void> => undefined,
)
const archiveHouseholdMock = vi.fn(
  async (_householdId: string): Promise<void> => undefined,
)
const updateHouseholdMock = vi.fn(
  async (
    _householdId: string,
    _payload: Record<string, unknown>,
  ): Promise<void> => undefined,
)

const storeState: {
  currentHousehold: {
    id: string
    name: string
    role: 'admin' | 'member'
  } | null
  members: Array<{ userId: string }>
  isLoading: boolean
  error: string | null
} = {
  currentHousehold: null,
  members: [],
  isLoading: false,
  error: null,
}

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'h-1' }),
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock('@/stores/household.store', () => ({
  householdActions: {
    fetchHouseholdById: (householdId: string) =>
      fetchHouseholdByIdMock(householdId),
    archiveHousehold: (householdId: string) =>
      archiveHouseholdMock(householdId),
    updateHousehold: (householdId: string, payload: Record<string, unknown>) =>
      updateHouseholdMock(householdId, payload),
  },
  useHouseholdStore: {
    use: {
      currentHousehold: () => storeState.currentHousehold,
      members: () => storeState.members,
      isLoading: () => storeState.isLoading,
      error: () => storeState.error,
    },
  },
}))

vi.mock('@/components/household', () => ({
  HouseholdDetailHeader: () => <div data-testid='household-detail-header' />,
  HouseholdSettingsCard: ({ isAdmin }: { isAdmin: boolean }) => (
    <div data-testid='household-settings-card'>
      {isAdmin ? 'admin' : 'member'}
    </div>
  ),
  HouseholdMembersCard: ({ isAdmin }: { isAdmin: boolean }) => (
    <div data-testid='household-members-card'>
      {isAdmin ? 'admin' : 'member'}
    </div>
  ),
  HouseholdDangerZoneCard: () => <div data-testid='household-danger-zone' />,
}))

describe('HouseholdDetailPage role-based affordances', () => {
  beforeEach(() => {
    replaceMock.mockClear()
    fetchHouseholdByIdMock.mockClear()
    archiveHouseholdMock.mockClear()
    updateHouseholdMock.mockClear()
    storeState.members = []
    storeState.isLoading = false
    storeState.error = null
  })

  it('renders admin affordances when current role is admin', () => {
    storeState.currentHousehold = {
      id: 'h-1',
      name: 'Family Admin',
      role: 'admin',
    }

    render(<HouseholdDetailPage />)

    expect(fetchHouseholdByIdMock).toHaveBeenCalledWith('h-1')

    expect(screen.getByTestId('household-settings-card')).toHaveTextContent(
      'admin',
    )

    expect(screen.getByTestId('household-members-card')).toHaveTextContent(
      'admin',
    )

    expect(screen.getByTestId('household-danger-zone')).toBeInTheDocument()
  })

  it('hides admin-only affordances when current role is member', () => {
    storeState.currentHousehold = {
      id: 'h-1',
      name: 'Family Member',
      role: 'member',
    }

    render(<HouseholdDetailPage />)

    expect(fetchHouseholdByIdMock).toHaveBeenCalledWith('h-1')

    expect(screen.getByTestId('household-settings-card')).toHaveTextContent(
      'member',
    )

    expect(screen.getByTestId('household-members-card')).toHaveTextContent(
      'member',
    )

    expect(
      screen.queryByTestId('household-danger-zone'),
    ).not.toBeInTheDocument()
  })

  it('shows structured loading placeholders instead of plain loading text', () => {
    storeState.currentHousehold = null
    storeState.isLoading = true

    const { container } = render(<HouseholdDetailPage />)

    expect(
      screen.queryByText(t('app.householdDetail.loading')),
    ).not.toBeInTheDocument()

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0)
  })

  it('uses comfortable spacing in the error state', () => {
    storeState.currentHousehold = null
    storeState.error = 'Load failed'

    render(<HouseholdDetailPage />)

    expect(screen.getByText('Load failed').parentElement).toHaveClass('pt-4')

    expect(
      screen.getByRole('button', {
        name: t('app.householdDetail.actions.retry'),
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Load failed')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.householdDetail.actions.retry'),
      }),
    )

    expect(fetchHouseholdByIdMock).toHaveBeenCalledTimes(2)
  })

  it('keeps the detail content visible when a non-fatal error exists alongside loaded household data', () => {
    storeState.currentHousehold = {
      id: 'h-1',
      name: 'Family Admin',
      role: 'admin',
    }

    storeState.error = 'Unable to remove member'

    render(<HouseholdDetailPage />)

    expect(screen.getByTestId('household-settings-card')).toBeInTheDocument()

    expect(screen.getByTestId('household-members-card')).toBeInTheDocument()

    expect(
      screen.queryByText('Unable to remove member'),
    ).not.toBeInTheDocument()
  })

  it('keeps the loaded detail content visible while shared loading flips during a follow-up action', () => {
    storeState.currentHousehold = {
      id: 'h-1',
      name: 'Family Admin',
      role: 'admin',
    }

    storeState.isLoading = true

    const { container } = render(<HouseholdDetailPage />)

    expect(screen.getByTestId('household-settings-card')).toBeInTheDocument()
    expect(screen.getByTestId('household-members-card')).toBeInTheDocument()
    expect(screen.getByTestId('household-danger-zone')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(0)
  })
})
