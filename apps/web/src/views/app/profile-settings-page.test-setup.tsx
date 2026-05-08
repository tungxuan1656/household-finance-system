import { vi } from 'vitest'

const profileSettingsPageMocks = vi.hoisted(() => ({
  fetchHouseholds: vi.fn(async () => []),
}))

export const { fetchHouseholds } = profileSettingsPageMocks

export const profileQueryState = {
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

export const updateProfileMutationState = {
  isPending: false,
  mutateAsync: vi.fn(async () => undefined),
}

export const householdStoreState: {
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

export function resetProfileSettingsPageTestState(): void {
  fetchHouseholds.mockClear()
  householdStoreState.error = null
  householdStoreState.households = []
  householdStoreState.isLoading = false
}
