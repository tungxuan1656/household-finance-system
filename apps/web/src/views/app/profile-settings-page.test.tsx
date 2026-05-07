import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { ProfileSettingsPage } from '@/views/app/profile-settings-page'

const { fetchHouseholds } = vi.hoisted(() => ({
  fetchHouseholds: vi.fn(async () => []),
}))

const profileQueryState = {
  data: {
    avatarUrl: null,
    createdAt: Date.now(),
    displayName: 'Alex Morgan',
    email: 'alex@example.com',
    id: 'user-1',
    quickAddLastSourceKey: 'cash' as const,
  },
  isError: false,
  isFetching: false,
  isLoading: false,
  refetch: vi.fn(async () => undefined),
}

const updateProfileMutationState = {
  isPending: false,
  mutateAsync: vi.fn(async () => undefined),
}

const householdStoreState: {
  error: string | null
  households: Array<{
    id: string
    name: string
    role: 'admin' | 'member'
  }>
  isLoading: boolean
} = {
  error: null,
  households: [],
  isLoading: false,
}

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/hooks/api/use-profile', () => ({
  useCurrentUserProfileQuery: () => profileQueryState,
  useUpdateCurrentUserProfileMutation: () => updateProfileMutationState,
}))

vi.mock('@/stores/household.store', () => ({
  householdActions: {
    fetchHouseholds,
  },
  useHouseholdStore: {
    use: {
      error: () => householdStoreState.error,
      households: () => householdStoreState.households,
      isLoading: () => householdStoreState.isLoading,
    },
  },
}))

vi.mock('@/components/profile', () => ({
  ProfileAvatarSection: () => <div data-testid='profile-avatar-section' />,
  ProfileDisplayNameForm: () => <div data-testid='profile-display-name-form' />,
}))

describe('ProfileSettingsPage settings hub', () => {
  beforeEach(() => {
    fetchHouseholds.mockClear()
    householdStoreState.error = null
    householdStoreState.households = []
    householdStoreState.isLoading = false
  })

  it('renders the locked settings hub layout and onboarding CTA when the user has no households', () => {
    render(<ProfileSettingsPage />)

    expect(
      screen.getByText(t('app.settings.account.title')),
    ).toBeInTheDocument()

    expect(
      screen.getByText(t('app.settings.memberships.title')),
    ).toBeInTheDocument()

    expect(
      screen.getByText(t('app.settings.shortcuts.title')),
    ).toBeInTheDocument()

    expect(
      screen.getByText(t('app.settings.profile.title')),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: t('common.actions.openOnboarding'),
      }),
    ).toHaveAttribute('href', PATHS.ONBOARDING)

    expect(fetchHouseholds).toHaveBeenCalledTimes(1)
  })

  it('shows member-safe shortcuts for a household member', () => {
    householdStoreState.households = [
      {
        id: 'household-1',
        name: 'Family One',
        role: 'member',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(
      screen.getByRole('link', {
        name: 'Family One',
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-1`)

    expect(
      screen.getByRole('link', {
        name: t('app.settings.shortcuts.actions.viewHousehold'),
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-1`)

    expect(screen.queryByText('Quản lý thành viên')).not.toBeInTheDocument()
    expect(screen.queryByText('Mở cài đặt gia đình')).not.toBeInTheDocument()
    expect(screen.queryByText('Mời thành viên')).not.toBeInTheDocument()

    expect(
      screen.getByText(
        t('app.householdDetail.members.invite.fields.role.options.member'),
      ),
    ).toBeInTheDocument()
  })

  it('shows admin-only shortcuts for an admin household membership', () => {
    householdStoreState.households = [
      {
        id: 'household-2',
        name: 'Admin Family',
        role: 'admin',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(
      screen.getByRole('link', {
        name: 'Admin Family',
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-2`)

    expect(
      screen.getByRole('link', {
        name: t('app.settings.shortcuts.actions.viewHousehold'),
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-2`)

    expect(screen.queryByText('Quản lý thành viên')).not.toBeInTheDocument()
    expect(screen.queryByText('Mở cài đặt gia đình')).not.toBeInTheDocument()
    expect(screen.queryByText('Mời thành viên')).not.toBeInTheDocument()

    expect(
      screen.getByText(
        t('app.householdDetail.members.invite.fields.role.options.admin'),
      ),
    ).toBeInTheDocument()
  })

  it('shows loading membership state without premature onboarding CTA', () => {
    householdStoreState.isLoading = true

    render(<ProfileSettingsPage />)

    expect(
      screen.getByText(t('app.settings.memberships.loading')),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: t('common.actions.openOnboarding'),
      }),
    ).not.toBeInTheDocument()
  })

  it('does not refetch households when memberships are already loaded', () => {
    householdStoreState.households = [
      {
        id: 'household-3',
        name: 'Loaded Household',
        role: 'member',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(fetchHouseholds).not.toHaveBeenCalled()
  })

  it('renders household error without onboarding CTA when list loading failed', () => {
    householdStoreState.error = 'Load households failed'

    render(<ProfileSettingsPage />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      t('app.settings.memberships.errors.loadFailed'),
    )

    expect(
      screen.getByRole('button', {
        name: t('app.settings.memberships.actions.retry'),
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: t('common.actions.openOnboarding'),
      }),
    ).not.toBeInTheDocument()
  })

  it('refetches households on mount even when a stale store error exists', () => {
    householdStoreState.error = 'Some older household error'

    render(<ProfileSettingsPage />)

    expect(fetchHouseholds).toHaveBeenCalledTimes(1)
  })

  it('retries household loading from the memberships error state', () => {
    householdStoreState.error = 'Load households failed'

    render(<ProfileSettingsPage />)

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.settings.memberships.actions.retry'),
      }),
    )

    expect(fetchHouseholds).toHaveBeenCalledTimes(2)
  })

  it('renders every current household membership', () => {
    householdStoreState.households = [
      {
        id: 'household-4',
        name: 'Family One',
        role: 'member',
      },
      {
        id: 'household-5',
        name: 'Family Two',
        role: 'admin',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(screen.getByRole('link', { name: 'Family One' })).toHaveAttribute(
      'href',
      `${PATHS.HOUSEHOLDS}/household-4`,
    )

    expect(screen.getByRole('link', { name: 'Family Two' })).toHaveAttribute(
      'href',
      `${PATHS.HOUSEHOLDS}/household-5`,
    )

    expect(screen.getAllByText('Family One')).toHaveLength(2)
    expect(screen.getAllByText('Family Two')).toHaveLength(2)
  })

  it('labels each shortcut group with the household name and only shows truthful actions', () => {
    householdStoreState.households = [
      {
        id: 'household-4',
        name: 'Family One',
        role: 'member',
      },
      {
        id: 'household-5',
        name: 'Family Two',
        role: 'admin',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(
      screen.getAllByRole('link', {
        name: t('app.settings.shortcuts.actions.viewHousehold'),
      }),
    ).toHaveLength(2)

    expect(screen.getAllByText('Family One')).toHaveLength(2)
    expect(screen.getAllByText('Family Two')).toHaveLength(2)

    expect(screen.queryByText('Quản lý thành viên')).not.toBeInTheDocument()
    expect(screen.queryByText('Mở cài đặt gia đình')).not.toBeInTheDocument()
    expect(screen.queryByText('Mời thành viên')).not.toBeInTheDocument()
  })
})
