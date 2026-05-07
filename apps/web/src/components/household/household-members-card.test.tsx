import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HouseholdMembersCard } from '@/components/household/household-members-card'
import { t } from '@/lib/i18n/t'

const fetchHouseholdMembersMock = vi.fn(
  async (_householdId: string): Promise<unknown[]> => [],
)
const removeHouseholdMemberMock = vi.fn(
  async (_householdId: string, _userId: string): Promise<void> => undefined,
)

const storeState: {
  members: Array<{
    userId: string
    name: string
    email: string
    role: 'admin' | 'member'
    joinedAt: number
  }>
  isLoading: boolean
  error: string | null
} = {
  members: [],
  isLoading: false,
  error: null,
}

vi.mock('@/components/household/household-invite-dialog', () => ({
  HouseholdInviteDialog: () => <div data-testid='invite-dialog' />,
}))

vi.mock('@/stores/household.store', () => ({
  householdActions: {
    fetchHouseholdMembers: (householdId: string) =>
      fetchHouseholdMembersMock(householdId),
    removeHouseholdMember: (householdId: string, userId: string) =>
      removeHouseholdMemberMock(householdId, userId),
  },
  useHouseholdStore: {
    use: {
      members: () => storeState.members,
      isLoading: () => storeState.isLoading,
      error: () => storeState.error,
    },
  },
}))

describe('HouseholdMembersCard', () => {
  beforeEach(() => {
    fetchHouseholdMembersMock.mockClear()
    removeHouseholdMemberMock.mockClear()

    storeState.members = [
      {
        userId: 'u-admin',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        joinedAt: Date.now() - 2000,
      },
      {
        userId: 'u-member',
        name: 'Member User',
        email: 'member@example.com',
        role: 'member',
        joinedAt: Date.now() - 1000,
      },
    ]

    storeState.isLoading = false
    storeState.error = null
  })

  it('shows invite and remove controls for admins', () => {
    render(<HouseholdMembersCard householdId='h-1' isAdmin={true} />)

    expect(fetchHouseholdMembersMock).toHaveBeenCalledWith('h-1')
    expect(screen.getByTestId('invite-dialog')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('hides invite and remove controls for non-admin members', () => {
    render(<HouseholdMembersCard householdId='h-1' isAdmin={false} />)

    expect(fetchHouseholdMembersMock).toHaveBeenCalledWith('h-1')
    expect(screen.queryByTestId('invite-dialog')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('renders members as a stacked list with confirmation dialog for removal', async () => {
    render(<HouseholdMembersCard householdId='h-1' isAdmin={true} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('member@example.com')).toBeInTheDocument()

    expect(
      screen.getAllByRole('button', {
        name: t('app.householdDetail.members.actions.remove'),
      })[0],
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getAllByRole('button', {
        name: t('app.householdDetail.members.actions.remove'),
      })[0],
    )

    expect(
      screen.getByRole('alertdialog', {
        name: t('app.householdDetail.members.removeDialog.title'),
      }),
    ).toBeInTheDocument()

    const footer = screen
      .getByRole('button', {
        name: t('app.householdDetail.members.removeDialog.confirm'),
      })
      .closest('[data-slot="alert-dialog-footer"]')

    expect(footer).toHaveClass('flex-col')
    expect(footer).not.toHaveClass('flex-col-reverse')

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.householdDetail.members.removeDialog.confirm'),
      }),
    )

    expect(removeHouseholdMemberMock).toHaveBeenCalledWith('h-1', 'u-admin')
  })

  it('shows a retry action when loading members fails', () => {
    storeState.members = []
    storeState.error = 'Unable to load members'

    render(<HouseholdMembersCard householdId='h-1' isAdmin={true} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.households.actions.retry'),
      }),
    )

    expect(fetchHouseholdMembersMock).toHaveBeenCalledTimes(2)
  })

  it('keeps existing members visible when member removal fails', async () => {
    const removeFailedMessage = t(
      'app.householdDetail.feedback.removeMemberFailed',
    )

    removeHouseholdMemberMock.mockImplementationOnce(async () => {
      storeState.error = 'Unable to remove member'
      throw new Error('remove failed')
    })

    const { rerender } = render(
      <HouseholdMembersCard householdId='h-1' isAdmin={true} />,
    )

    fireEvent.click(
      screen.getAllByRole('button', {
        name: t('app.householdDetail.members.actions.remove'),
      })[0],
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.householdDetail.members.removeDialog.confirm'),
      }),
    )

    rerender(<HouseholdMembersCard householdId='h-1' isAdmin={true} />)

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('member@example.com')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(removeFailedMessage)).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', { name: t('app.households.actions.retry') }),
    ).toBeInTheDocument()
  })

  it('does not replace the remove-member banner with an unrelated shared store error', async () => {
    const removeFailedMessage = t(
      'app.householdDetail.feedback.removeMemberFailed',
    )

    removeHouseholdMemberMock.mockImplementationOnce(async () => {
      storeState.error = 'Unable to remove member'
      throw new Error('remove failed')
    })

    const { rerender } = render(
      <HouseholdMembersCard householdId='h-1' isAdmin={true} />,
    )

    fireEvent.click(
      screen.getAllByRole('button', {
        name: t('app.householdDetail.members.actions.remove'),
      })[0],
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.householdDetail.members.removeDialog.confirm'),
      }),
    )

    rerender(<HouseholdMembersCard householdId='h-1' isAdmin={true} />)

    await waitFor(() => {
      expect(screen.getByText(removeFailedMessage)).toBeInTheDocument()
    })

    storeState.error = 'Update household failed'
    rerender(<HouseholdMembersCard householdId='h-1' isAdmin={true} />)

    expect(screen.getByText(removeFailedMessage)).toBeInTheDocument()

    expect(
      screen.queryByText('Update household failed'),
    ).not.toBeInTheDocument()
  })

  it('keeps existing members visible while shared loading flips during a background member action', () => {
    storeState.isLoading = true

    const { container } = render(
      <HouseholdMembersCard householdId='h-1' isAdmin={true} />,
    )

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('member@example.com')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(0)
  })
})
