import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExpenseForm } from '@/components/expense/expense-form'
import type { HouseholdDTO } from '@/types/household'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

const createMutateMock = vi.fn()
const updateMutateMock = vi.fn()

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/hooks/api/use-profile', () => ({
  useCurrentUserProfileQuery: () => ({
    data: {
      id: 'user-1',
      displayName: 'Owner',
      email: 'owner@example.com',
      avatarUrl: null,
      createdAt: Date.now(),
    },
  }),
}))

vi.mock('@/hooks/api/use-expense', () => ({
  useCreateExpenseMutation: () => ({
    isPending: false,
    mutate: createMutateMock,
  }),
  useUpdateExpenseMutation: () => ({
    isPending: false,
    mutate: updateMutateMock,
  }),
}))

vi.mock('@/components/expense/category-picker', () => ({
  CategoryPicker: ({
    id,
    value,
    onValueChange,
  }: {
    id: string
    value?: string
    onValueChange: (value: string) => void
  }) => (
    <select
      aria-label='category'
      id={id}
      value={value ?? ''}
      onChange={(event) => onValueChange(event.target.value)}>
      <option value=''>Select category</option>
      <option value='food'>Food</option>
      <option value='transport'>Transport</option>
    </select>
  ),
}))

vi.mock('@/components/expense/source-picker', () => ({
  SourcePicker: ({
    id,
    value,
    onValueChange,
  }: {
    id: string
    value?: string
    onValueChange: (value: string) => void
  }) => (
    <select
      aria-label='source'
      id={id}
      value={value ?? ''}
      onChange={(event) => onValueChange(event.target.value)}>
      <option value=''>Select source</option>
      <option value='cash'>Cash</option>
      <option value='bank-transfer'>Bank transfer</option>
    </select>
  ),
}))

const categories: ReferenceCategoryDTO[] = [
  {
    key: 'food',
    kind: 'expense',
    iconUrl: '/food.svg',
    color: '#f97316',
  },
  {
    key: 'transport',
    kind: 'expense',
    iconUrl: '/transport.svg',
    color: '#2563eb',
  },
]

const households: HouseholdDTO[] = [
  {
    id: 'household-1',
    name: 'Family',
    slug: 'family',
    defaultCurrencyCode: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    defaultVisibility: 'household',
    role: 'admin',
    createdAt: Date.now(),
  },
]

describe('ExpenseForm edit mode', () => {
  beforeEach(() => {
    createMutateMock.mockClear()
    updateMutateMock.mockClear()
  })

  it('pre-fills existing values and submits an update payload', async () => {
    const user = userEvent.setup()

    render(
      <ExpenseForm
        categories={categories}
        expenseId='expense-1'
        households={households}
        initialValues={{
          amount: 125000,
          categoryKey: 'food',
          sourceKey: 'cash',
          title: 'Lunch',
          occurredAt: new Date(2026, 4, 3).getTime(),
          note: 'team lunch',
          visibility: 'household',
          householdId: 'household-1',
        }}
        mode='edit'
      />,
    )

    expect(screen.getByDisplayValue('Lunch')).toBeInTheDocument()
    expect(screen.getByDisplayValue('125000')).toBeInTheDocument()

    const titleInput = screen.getByLabelText('Tiêu đề')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated lunch')

    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(updateMutateMock).toHaveBeenCalledWith(
      {
        id: 'expense-1',
        payload: {
          amount: 125000,
          categoryKey: 'food',
          sourceKey: 'cash',
          title: 'Updated lunch',
          occurredAt: new Date(2026, 4, 3).getTime(),
          note: 'team lunch',
          visibility: 'household',
          householdId: 'household-1',
        },
      },
      expect.any(Object),
    )
  })
})
