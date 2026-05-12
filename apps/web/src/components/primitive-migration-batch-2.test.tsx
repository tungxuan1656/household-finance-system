import { render } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CategoryLimitsSection } from '@/components/budget/fields/category-limits-section'
import { ExpenseFeedFilters } from '@/components/expense/expense-feed-filters'
import type { CreateHouseholdFormValues } from '@/lib/forms/household.schema'

const inputCalls: Array<Record<string, unknown>> = []
const nativeSelectCalls: Array<Record<string, unknown>> = []
const selectTriggerCalls: Array<Record<string, unknown>> = []

vi.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => {
    inputCalls.push(props)

    return <input data-testid='input' />
  },
}))

vi.mock('@/components/ui/native-select', () => ({
  NativeSelect: (props: Record<string, unknown>) => {
    nativeSelectCalls.push(props)

    return <select data-testid='native-select' />
  },
  NativeSelectOption: (props: Record<string, unknown>) => <option {...props} />,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectTrigger: (props: Record<string, unknown>) => {
    selectTriggerCalls.push(props)

    return <button data-testid='select-trigger' />
  },
  SelectValue: () => null,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}))

vi.mock('@/components/ui/field', () => ({
  Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FieldContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FieldDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FieldError: () => null,
  FieldGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FieldLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
}))

vi.mock('@/hooks/api/use-reference-data', () => ({
  useReferenceCategoriesQuery: () => ({
    data: { items: [{ key: 'food', kind: 'expense', color: '#fff' }] },
  }),
}))

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

beforeEach(() => {
  inputCalls.length = 0
  nativeSelectCalls.length = 0
  selectTriggerCalls.length = 0
})

import { CreateHouseholdForm } from '@/views/app/onboarding/create-household-form'

function renderCreateHouseholdForm() {
  function Wrapper() {
    const form = useForm<CreateHouseholdFormValues>({
      defaultValues: { name: '' },
    })

    return (
      <CreateHouseholdForm form={form} isLoading={false} onSubmit={vi.fn()} />
    )
  }

  render(<Wrapper />)
}

describe('batch 2 primitive migrations', () => {
  it('uses primitive sizes instead of shell compensation classes in expense filters', () => {
    render(
      <ExpenseFeedFilters
        categories={[]}
        groups={[]}
        values={{
          amountMax: '',
          amountMin: '',
          categoryKey: '',
          dateFrom: '',
          dateTo: '',
          groupId: '',
          search: '',
          sort: '',
          visibility: '',
        }}
        onChange={vi.fn()}
      />,
    )

    expect(inputCalls[0]?.className).toBeUndefined()
    expect(inputCalls[0]?.size).toBe('lg')
    expect(inputCalls[0]?.type).toBe('search')
    expect(inputCalls[1]?.type).toBe('date')
    expect(inputCalls[2]?.type).toBe('date')
    expect(inputCalls[3]?.type).toBe('number')
    expect(inputCalls[4]?.type).toBe('number')

    expect(
      nativeSelectCalls.every((call) => call.className === undefined),
    ).toBe(true)

    expect(nativeSelectCalls.every((call) => call.size === 'lg')).toBe(true)
    expect(inputCalls).toHaveLength(5)
    expect(nativeSelectCalls).toHaveLength(4)
  })

  it('keeps create household form shell layout separate from control styling', () => {
    renderCreateHouseholdForm()

    expect(inputCalls.at(-1)?.className).toBeUndefined()
    expect(inputCalls.at(-1)?.['aria-invalid']).toBe(false)
    expect(inputCalls.at(-1)?.id).toBe('household-name')

    expect(inputCalls.at(-1)?.placeholder).toBe(
      'app.onboarding.fields.householdName.placeholder',
    )

    expect(inputCalls.at(-1)?.name).toBe('name')
  })

  it('renders the advanced filters shell through shared card primitives', () => {
    render(
      <ExpenseFeedFilters
        categories={[]}
        groups={[]}
        values={{
          amountMax: '',
          amountMin: '',
          categoryKey: '',
          dateFrom: '',
          dateTo: '',
          groupId: '',
          search: '',
          sort: '',
          visibility: '',
        }}
        onChange={vi.fn()}
      />,
    )

    expect(document.querySelector('[data-slot="card"]')).toBeTruthy()
    expect(document.querySelector('[data-slot="card-header"]')).toBeTruthy()
    expect(document.querySelector('[data-slot="card-content"]')).toBeTruthy()
    expect(document.querySelector('details')).toBeTruthy()
    expect(document.querySelector('summary')).toBeTruthy()
  })

  it('keeps the category limits select wired to the unified selection primitive', () => {
    render(
      <CategoryLimitsSection
        categoryLimits={[]}
        isSubmitting={false}
        onCategoryLimitsChange={vi.fn()}
      />,
    )

    expect(selectTriggerCalls).toHaveLength(1)
    expect(selectTriggerCalls[0]?.size).toBe('lg')
    expect(selectTriggerCalls[0]?.className).toBeUndefined()
    expect(selectTriggerCalls[0]?.children).toBeDefined()

    expect(
      (selectTriggerCalls[0]?.children as { props?: Record<string, unknown> })
        ?.props?.placeholder,
    ).toBe('budgets.fields.categoryLimits.selectCategory')

    expect(selectTriggerCalls[0]?.disabled).toBeUndefined()
  })
})
