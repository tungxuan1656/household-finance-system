import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HouseholdMembersCard } from '@/components/household/household-members-card'

const fetchHouseholdMembersMock = vi.fn(
  async (_householdId: string): Promise<unknown[]> => [],
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
  members: [
    {
      userId: 'u-admin',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      joinedAt: 1,
    },
  ],
  isLoading: false,
  error: 'Update household failed',
}

vi.mock('@/components/household/household-invite-dialog', () => ({
  HouseholdInviteDialog: () => <div data-testid='invite-dialog' />,
}))

vi.mock('@/stores/household.store', () => ({
  householdActions: {
    fetchHouseholdMembers: (householdId: string) =>
      fetchHouseholdMembersMock(householdId),
    removeHouseholdMember: vi.fn(async () => undefined),
  },
  useHouseholdStore: {
    use: {
      members: () => storeState.members,
      isLoading: () => storeState.isLoading,
      error: () => storeState.error,
    },
  },
}))

describe('HouseholdMembersCard shared error handling', () => {
  it('does not show a members retry banner for unrelated shared store errors', () => {
    render(<HouseholdMembersCard householdId='h-1' isAdmin={true} />)

    expect(screen.getByText('Admin User')).toBeInTheDocument()

    expect(
      screen.queryByText('Update household failed'),
    ).not.toBeInTheDocument()
  })
})
