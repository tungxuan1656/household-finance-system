import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type DialogContentProps = {
  className?: string
  children?: ReactNode
  size?: 'sm' | 'default' | 'lg'
  surface?: 'glass' | 'subtle' | 'outline' | 'solid'
  showCloseButton?: boolean
}

const dialogContentCalls: Array<
  Pick<DialogContentProps, 'className' | 'size' | 'surface' | 'showCloseButton'>
> = []

vi.mock('@/lib/i18n/t', () => ({
  t: (key: string) => key,
}))

vi.mock('@/components/budget/budget-form', () => ({
  BudgetForm: () => <div data-testid='budget-form' />,
}))

vi.mock('@/components/group/group-form', () => ({
  GroupForm: () => <div data-testid='group-form' />,
}))

vi.mock('@/components/expense/quick-add/quick-add-expense-form', () => ({
  QuickAddExpenseForm: () => <div data-testid='quick-add-form' />,
}))

vi.mock('@/hooks/api/use-expense', () => ({
  useDeleteExpenseMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useRecentQuickAddExpensesQuery: () => ({ data: { items: [] } }),
}))

vi.mock('@/hooks/api/use-groups', () => ({
  useExpenseGroupListQuery: () => ({ data: { items: [] } }),
}))

vi.mock('@/hooks/api/use-households', () => ({
  useHouseholdMembersQuery: () => ({ data: { items: [] } }),
  useHouseholdsQuery: () => ({ data: { items: [] } }),
}))

vi.mock('@/hooks/api/use-profile', () => ({
  useCurrentUserProfileQuery: () => ({ data: null }),
  useUpdateCurrentUserProfileMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => ({ data: { items: [] } }),
}))

vi.mock('@/components/expense/quick-add/use-quick-add-dialog-state', () => ({
  useQuickAddDialogState: () => ({
    handleOpenChange: vi.fn(),
    handleSaveAsPrivate: vi.fn(),
    openedAtRef: { current: null },
    setSubmitError: vi.fn(),
    submitError: null,
    watchedHouseholdId: undefined,
    watchedVisibility: 'private',
  }),
}))

vi.mock('@/components/expense/use-expense-form', () => ({
  useExpenseForm: () => ({
    form: {
      control: {},
      getValues: vi.fn(),
      handleSubmit: (submit: unknown) => submit,
      setValue: vi.fn(),
    },
    onSubmit: vi.fn(),
    isSubmitting: false,
  }),
}))

vi.mock('@/components/expense/quick-add/quick-add-defaults', () => ({
  buildQuickAddInitialValues: () => ({}),
  buildQuickAddSubmitError: () => null,
}))

vi.mock('@/components/expense/quick-add/quick-add-toast-effects', () => ({
  reportQuickAddSuccessTiming: vi.fn(),
  showQuickAddUndoToast: vi.fn(),
}))

vi.mock('@/components/ui/dialog', async () => {
  const actual = await vi.importActual<typeof import('@/components/ui/dialog')>(
    '@/components/ui/dialog',
  )

  return {
    ...actual,
    DialogContent: ({
      children,
      className,
      size,
      surface,
      showCloseButton,
    }: DialogContentProps) => {
      dialogContentCalls.push({ className, size, surface, showCloseButton })

      return (
        <div data-slot='dialog-content' data-testid='dialog-content'>
          {children}
        </div>
      )
    },
    DialogOverlay: () => <div data-slot='dialog-overlay' />,
    DialogPortal: ({ children }: { children: ReactNode }) => <>{children}</>,
  }
})

import { CreateBudgetDialog } from '@/components/budget/create-budget-dialog'
import { EditBudgetDialog } from '@/components/budget/edit-budget-dialog'
import { QuickAddExpenseDialog } from '@/components/expense/quick-add-expense-dialog'
import { CreateGroupDialog } from '@/components/group/create-group-dialog'
import { EditGroupDialog } from '@/components/group/edit-group-dialog'

describe('dialog shell migrations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dialogContentCalls.length = 0
  })

  it('keeps budget dialog consumers free of shell-restyling classes', () => {
    render(
      <>
        <CreateBudgetDialog
          open
          householdId='household-1'
          isSubmitting={false}
          onOpenChange={vi.fn()}
          onSubmit={vi.fn()}
        />
        <EditBudgetDialog
          budget={
            {
              categoryLimits: [],
              householdId: 'household-1',
              period: '2026-05',
              totalLimitMinor: 1000,
            } as never
          }
          isSubmitting={false}
          onOpenChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </>,
    )

    expect(dialogContentCalls).toHaveLength(2)

    dialogContentCalls.forEach((props) => {
      expect(props.className).toBeUndefined()
      expect(props.surface).toBeUndefined()
      expect(props.showCloseButton).toBe(false)
    })

    dialogContentCalls.forEach((props) => {
      expect(props.size).toBe('default')
    })
  })

  it('keeps group dialog consumers free of shell-restyling classes', () => {
    render(
      <>
        <CreateGroupDialog
          open
          householdId='household-1'
          isSubmitting={false}
          onOpenChange={vi.fn()}
          onSubmit={vi.fn()}
        />
        <EditGroupDialog
          group={
            {
              description: null,
              endDate: null,
              eventBudgetMinor: null,
              householdId: 'household-1',
              id: 'group-1',
              name: 'Group',
              startDate: null,
            } as never
          }
          isSubmitting={false}
          onOpenChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </>,
    )

    expect(dialogContentCalls).toHaveLength(2)

    dialogContentCalls.forEach((props) => {
      expect(props.className).toBeUndefined()
      expect(props.surface).toBeUndefined()
      expect(props.showCloseButton).toBe(false)
      expect(props.size).toBe('default')
    })
  })

  it('keeps quick add expense dialog free of shell-restyling classes', () => {
    render(<QuickAddExpenseDialog open onOpenChange={vi.fn()} />)

    expect(dialogContentCalls).toHaveLength(1)
    expect(dialogContentCalls[0]?.className).toBeUndefined()
    expect(dialogContentCalls[0]?.surface).toBeUndefined()
    expect(dialogContentCalls[0]?.showCloseButton).toBeUndefined()
    expect(dialogContentCalls[0]?.size).toBe('default')
  })
})
