import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GroupList } from '@/components/group/group-list'
import { useExpenseGroupListQuery } from '@/hooks/api/use-groups'
import type { ExpenseGroupDTO } from '@/types/group'

vi.mock('@/hooks/api/use-groups')

const mockedQuery = vi.mocked(useExpenseGroupListQuery)

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

const baseGroup: ExpenseGroupDTO = {
  id: 'group-1',
  name: 'Test Group',
  description: 'A test group',
  status: 'active',
  startDate: Date.UTC(2026, 0, 1),
  endDate: Date.UTC(2026, 11, 31),
  eventBudgetMinor: null,
  totalSpendMinor: 0,
  householdId: 'hh-1',
  createdByUserId: 'user-1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

describe('GroupList', () => {
  beforeEach(() => {
    mockedQuery.mockReset()
  })

  it('renders loading state', () => {
    mockedQuery.mockReturnValue({ isLoading: true } as ReturnType<
      typeof useExpenseGroupListQuery
    >)

    const { container } = render(
      <GroupList householdId='hh-1' onArchive={vi.fn()} onEdit={vi.fn()} />,
    )

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no groups', () => {
    mockedQuery.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useExpenseGroupListQuery>)

    render(
      <GroupList householdId='hh-1' onArchive={vi.fn()} onEdit={vi.fn()} />,
    )

    expect(screen.getByText('groups.empty.title')).toBeInTheDocument()
    expect(screen.getByText('groups.empty.description')).toBeInTheDocument()
  })

  it('renders group cards when data available', () => {
    mockedQuery.mockReturnValue({
      data: {
        items: [
          baseGroup,
          { ...baseGroup, id: 'group-2', name: 'Second Group' },
        ],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useExpenseGroupListQuery>)

    render(
      <GroupList householdId='hh-1' onArchive={vi.fn()} onEdit={vi.fn()} />,
    )

    expect(screen.getByText('Test Group')).toBeInTheDocument()
    expect(screen.getByText('Second Group')).toBeInTheDocument()
  })

  it('calls onEdit with correct group', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()

    mockedQuery.mockReturnValue({
      data: { items: [baseGroup] },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useExpenseGroupListQuery>)

    render(<GroupList householdId='hh-1' onArchive={vi.fn()} onEdit={onEdit} />)

    await user.click(
      screen.getByRole('button', { name: /common\.actions\.edit/ }),
    )

    expect(onEdit).toHaveBeenCalledWith(baseGroup)
  })

  it('calls onArchive with correct group', async () => {
    const onArchive = vi.fn()
    const user = userEvent.setup()

    mockedQuery.mockReturnValue({
      data: { items: [baseGroup] },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useExpenseGroupListQuery>)

    render(
      <GroupList householdId='hh-1' onArchive={onArchive} onEdit={vi.fn()} />,
    )

    await user.click(
      screen.getByRole('button', { name: /groups\.actions\.archive/ }),
    )

    expect(onArchive).toHaveBeenCalledWith(baseGroup)
  })
})
