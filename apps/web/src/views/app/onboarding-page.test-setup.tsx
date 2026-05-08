import { vi } from 'vitest'

export const replaceMock = vi.fn()
export const createHouseholdMock = vi.fn()
export const acceptInvitationMock = vi.fn()
export const getInvitationPreviewMock = vi.fn()
export const toastSuccessMock = vi.fn()
export const toastErrorMock = vi.fn()
export let searchParamsState = new URLSearchParams()
export const mockStoreState = {
  currentHousehold: null as null | { id: string },
  households: [] as Array<{ id: string }>,
  isLoading: false,
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsState,
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}))

vi.mock('@/api/invitation', () => ({
  acceptInvitation: (...args: unknown[]) => acceptInvitationMock(...args),
  getInvitationPreview: (...args: unknown[]) =>
    getInvitationPreviewMock(...args),
}))

vi.mock('@/components/expense/quick-add-expense-dialog', () => ({
  QuickAddExpenseDialog: () => <div data-testid='quick-add-dialog' />,
}))

vi.mock('@/components/household/household-invite-dialog', () => ({
  HouseholdInviteDialog: ({ householdId }: { householdId: string }) => (
    <button type='button'>{`invite:${householdId}`}</button>
  ),
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: {
    use: {
      isAuthenticated: () => true,
      isSessionChecked: () => true,
    },
  },
}))

vi.mock('@/stores/household.store', () => ({
  householdActions: {
    createHousehold: (...args: unknown[]) => createHouseholdMock(...args),
  },
  useHouseholdStore: {
    use: {
      households: () => mockStoreState.households,
      currentHousehold: () => mockStoreState.currentHousehold,
      isLoading: () => mockStoreState.isLoading,
    },
  },
}))

export function setSearchParamsState(next: URLSearchParams): void {
  searchParamsState = next
}

export function resetOnboardingPageTestState(): void {
  replaceMock.mockClear()
  createHouseholdMock.mockReset()
  acceptInvitationMock.mockReset()
  getInvitationPreviewMock.mockReset()
  toastSuccessMock.mockClear()
  toastErrorMock.mockClear()

  searchParamsState = new URLSearchParams()

  mockStoreState.currentHousehold = null
  mockStoreState.households = []
  mockStoreState.isLoading = false

  createHouseholdMock.mockResolvedValue({ id: 'hh-1', name: 'Home' })

  getInvitationPreviewMock.mockResolvedValue({
    household: { id: 'hh-2', name: 'Joined Home' },
    invitedRole: 'member',
    expiresAt: new Date('2026-05-06T12:00:00.000Z'),
  })

  acceptInvitationMock.mockResolvedValue({ householdId: 'hh-2' })
}
