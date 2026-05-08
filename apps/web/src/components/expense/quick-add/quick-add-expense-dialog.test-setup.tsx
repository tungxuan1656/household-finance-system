import { vi } from 'vitest'

const quickAddDialogMocks = vi.hoisted(() => ({
  createMutateMock: vi.fn(),
  deleteMutateMock: vi.fn(),
  updateProfileMutateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  quickAddMetricSpy: vi.fn(),
}))

export const {
  createMutateMock,
  deleteMutateMock,
  updateProfileMutateMock,
  toastSuccessMock,
  toastErrorMock,
  quickAddMetricSpy,
} = quickAddDialogMocks

export let currentProfile = {
  id: 'user-1',
  displayName: 'Owner',
  email: 'owner@example.com',
  avatarUrl: null,
  quickAddLastSourceKey: null as 'cash' | 'bank-transfer' | null,
  createdAt: 1,
}

export let recentExpenses = [] as Array<{
  id: string
  amountMinor: number
  currencyCode: string
  categoryKey: 'food'
  sourceKey: 'cash' | 'bank-transfer'
  title: string
  occurredAt: number
  note: string | null
  visibility: 'private' | 'household'
  householdId: string | null
  payerUserId: string | null
  createdByUserId: string
  createdAt: number
  updatedAt: number
}>

vi.mock('sonner', () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

vi.mock('@/hooks/api/use-profile', () => ({
  useCurrentUserProfileQuery: () => ({ data: currentProfile }),
  useUpdateCurrentUserProfileMutation: () => ({
    isPending: false,
    mutate: updateProfileMutateMock,
  }),
}))

vi.mock('@/hooks/api/use-expense', () => ({
  useCreateExpenseMutation: () => ({
    isPending: false,
    mutate: createMutateMock,
  }),
  useDeleteExpenseMutation: () => ({
    isPending: false,
    mutate: deleteMutateMock,
  }),
  useUpdateExpenseMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useRecentQuickAddExpensesQuery: () => ({
    data: { items: recentExpenses, nextCursor: null },
  }),
}))

vi.mock('@/hooks/api/use-households', () => ({
  useHouseholdsQuery: () => ({
    data: {
      items: [
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
        {
          id: 'household-2',
          name: 'Friends',
          slug: 'friends',
          defaultCurrencyCode: 'VND',
          timezone: 'Asia/Ho_Chi_Minh',
          defaultVisibility: 'household',
          role: 'member',
          createdAt: Date.now(),
        },
      ],
    },
  }),
  useHouseholdMembersQuery: (householdId?: string) => ({
    data:
      householdId === 'household-2'
        ? { items: [{ userId: 'user-2', name: 'Friend', role: 'member' }] }
        : { items: [{ userId: 'user-1', name: 'Owner', role: 'admin' }] },
  }),
}))

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => ({
    data: {
      items: [
        {
          key: 'food',
          kind: 'expense',
          iconUrl: '/food.svg',
          color: '#f97316',
        },
      ],
    },
  }),
}))

vi.mock('@/hooks/api/use-groups', () => ({
  useExpenseGroupListQuery: (householdId?: string) => ({
    data:
      householdId === 'household-1'
        ? {
            items: [
              {
                id: 'group-1',
                name: 'Trip',
                description: 'Trip fund',
                status: 'active',
                startDate: Date.now(),
                endDate: Date.now(),
                eventBudgetMinor: null,
                totalSpendMinor: 0,
                householdId: 'household-1',
                createdByUserId: 'user-1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            ],
          }
        : { items: [] },
  }),
}))

vi.mock('@/lib/metrics/quick-add-metrics', () => ({
  reportQuickAddTiming: quickAddMetricSpy,
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
      aria-label='quick-add-category'
      id={id}
      value={value ?? ''}
      onChange={(event) => onValueChange(event.target.value)}>
      <option value=''>Select category</option>
      <option value='food'>Food</option>
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
      aria-label='quick-add-source'
      id={id}
      value={value ?? ''}
      onChange={(event) => onValueChange(event.target.value)}>
      <option value=''>Select source</option>
      <option value='cash'>Cash</option>
      <option value='bank-transfer'>Bank transfer</option>
    </select>
  ),
}))

export function resetQuickAddDialogTestState() {
  createMutateMock.mockReset()
  deleteMutateMock.mockReset()
  updateProfileMutateMock.mockReset()

  updateProfileMutateMock.mockImplementation((_payload, options) => {
    options?.onSettled?.()
  })

  toastSuccessMock.mockReset()
  toastErrorMock.mockReset()
  quickAddMetricSpy.mockReset()

  currentProfile = {
    id: 'user-1',
    displayName: 'Owner',
    email: 'owner@example.com',
    avatarUrl: null,
    quickAddLastSourceKey: null,
    createdAt: 1,
  }

  recentExpenses = []
  window.localStorage.clear()
  window.sessionStorage.clear()
}
