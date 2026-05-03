import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { GroupCard } from '@/components/group/group-card'

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

const baseGroup = {
  id: 'group-1',
  name: 'Test Group',
  description: 'A test group description',
  status: 'active' as const,
  startDate: Date.UTC(2026, 0, 1),
  endDate: Date.UTC(2026, 11, 31),
  eventBudgetMinor: null,
  totalSpendMinor: 0,
  householdId: 'hh-1',
  createdByUserId: 'user-1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

describe('GroupCard', () => {
  it('renders group name and description', () => {
    render(<GroupCard group={baseGroup} />)

    expect(screen.getByText('Test Group')).toBeInTheDocument()
    expect(screen.getByText('A test group description')).toBeInTheDocument()
  })

  it('renders budget progress bar when eventBudgetMinor is set', () => {
    const groupWithBudget = {
      ...baseGroup,
      eventBudgetMinor: 1_000_000,
      totalSpendMinor: 250_000,
    }

    render(<GroupCard group={groupWithBudget} />)

    // Budget-related labels appear when a budget is set
    expect(screen.getByText(/groups\.card\.spentLabel/)).toBeInTheDocument()
    expect(screen.getByText(/groups\.card\.budgetLabel/)).toBeInTheDocument()
    // "No budget" text should not appear
    expect(screen.queryByText('groups.card.noBudget')).not.toBeInTheDocument()
  })

  it('renders edit and archive buttons when callbacks provided', () => {
    render(
      <GroupCard group={baseGroup} onArchive={() => {}} onEdit={() => {}} />,
    )

    expect(
      screen.getByRole('button', { name: /common\.actions\.edit/ }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /groups\.actions\.archive/ }),
    ).toBeInTheDocument()
  })

  it('does not render edit/archive buttons when callbacks not provided', () => {
    render(<GroupCard group={baseGroup} />)

    expect(
      screen.queryByRole('button', { name: /common\.actions\.edit/ }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: /groups\.actions\.archive/ }),
    ).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()

    render(<GroupCard group={baseGroup} onEdit={onEdit} />)

    await user.click(
      screen.getByRole('button', { name: /common\.actions\.edit/ }),
    )

    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('calls onArchive when archive button clicked', async () => {
    const onArchive = vi.fn()
    const user = userEvent.setup()

    render(
      <GroupCard
        group={{ ...baseGroup, status: 'active' }}
        onArchive={onArchive}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /groups\.actions\.archive/ }),
    )

    expect(onArchive).toHaveBeenCalledOnce()
  })
})
