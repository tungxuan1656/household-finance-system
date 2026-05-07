import { render, screen } from '@testing-library/react'
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

    expect(screen.getByText('Family One')).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: t('app.settings.shortcuts.actions.viewHousehold'),
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-1`)

    expect(
      screen.queryByRole('link', {
        name: t('app.settings.shortcuts.actions.manageMembers'),
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: t('app.settings.shortcuts.actions.leaveHousehold'),
      }),
    ).not.toBeInTheDocument()
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
        name: t('app.settings.shortcuts.actions.manageMembers'),
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-2`)

    expect(
      screen.getByRole('link', {
        name: t('app.settings.shortcuts.actions.openHouseholdSettings'),
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-2`)

    expect(
      screen.getByRole('link', {
        name: t('app.settings.shortcuts.actions.inviteMembers'),
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-2`)
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
})
