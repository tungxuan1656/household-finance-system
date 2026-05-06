import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OnboardingPage } from '@/views/app/onboarding-page'

const replaceMock = vi.fn()
const createHouseholdMock = vi.fn()
const acceptInvitationMock = vi.fn()
const getInvitationPreviewMock = vi.fn()
const toastSuccessMock = vi.fn()
const toastErrorMock = vi.fn()
let searchParamsState = new URLSearchParams()
const mockStoreState = {
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

describe('OnboardingPage', () => {
  beforeEach(() => {
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
  })

  it('lets user switch to join-via-invite flow and preview token invite', async () => {
    render(<OnboardingPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'app.onboarding.actions.joinPath' }),
    )

    fireEvent.change(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
      {
        target: { value: 'invite-token-123' },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.previewInvite',
      }),
    )

    await waitFor(() => {
      expect(getInvitationPreviewMock).toHaveBeenCalledWith('invite-token-123')
    })

    expect(screen.getByText('Joined Home')).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.acceptInvite',
      }),
    ).toBeInTheDocument()
  })

  it('normalizes pasted full invite link before preview and accept', async () => {
    render(<OnboardingPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'app.onboarding.actions.joinPath' }),
    )

    fireEvent.change(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
      {
        target: {
          value: 'https://app.example.com/invitations/invite-token-123',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.previewInvite',
      }),
    )

    await waitFor(() => {
      expect(getInvitationPreviewMock).toHaveBeenCalledWith('invite-token-123')
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.acceptInvite',
      }),
    )

    await waitFor(() => {
      expect(acceptInvitationMock).toHaveBeenCalledWith('invite-token-123')
    })
  })

  it('prefills invite token from deep link and clears stale preview when token changes', async () => {
    searchParamsState.set('inviteToken', 'invite-token-123')

    const { rerender } = render(<OnboardingPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'app.onboarding.actions.joinPath' }),
    )

    expect(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
    ).toHaveValue('invite-token-123')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.previewInvite',
      }),
    )

    await screen.findByText('Joined Home')

    searchParamsState = new URLSearchParams('inviteToken=invite-token-789')
    rerender(<OnboardingPage />)

    expect(screen.queryByText('Joined Home')).not.toBeInTheDocument()

    fireEvent.change(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
      {
        target: { value: 'invite-token-456' },
      },
    )

    expect(screen.queryByText('Joined Home')).not.toBeInTheDocument()
  })

  it('prefills invite token from invite path deep link', () => {
    searchParamsState = new URLSearchParams(
      'from=%2Finvitations%2Finvite-token-123',
    )

    render(<OnboardingPage />)

    expect(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
    ).toHaveValue('invite-token-123')
  })

  it('falls back to from when inviteToken query is present but empty', () => {
    searchParamsState = new URLSearchParams(
      'inviteToken=&from=%2Finvitations%2Finvite-token-123',
    )

    render(<OnboardingPage />)

    expect(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
    ).toHaveValue('invite-token-123')
  })

  it('redirects existing household members away from onboarding', async () => {
    mockStoreState.households = [{ id: 'hh-9' }]

    render(<OnboardingPage />)

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/households')
    })
  })

  it('shows completion actions after household creation succeeds', async () => {
    render(<OnboardingPage />)

    fireEvent.change(
      screen.getByLabelText('app.onboarding.fields.householdName.label'),
      {
        target: { value: 'Family Home' },
      },
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'app.onboarding.actions.create' }),
    )

    await waitFor(() => {
      expect(createHouseholdMock).toHaveBeenCalledWith({ name: 'Family Home' })
    })

    expect(
      screen.getByRole('button', { name: 'invite:hh-1' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'app.onboarding.actions.openBudgetSetup',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.openQuickAdd',
      }),
    ).toBeInTheDocument()
  })
})
