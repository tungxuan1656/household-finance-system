import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HouseholdMembersCard } from '@/components/household/household-members-card'

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
})
