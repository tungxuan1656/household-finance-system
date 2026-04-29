import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { CategoryPicker } from '@/components/expense/category-picker'
import { t } from '@/lib/i18n/t'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

let currentItems: string[] = []
let currentOnValueChange: ((value: string | null) => void) | undefined

vi.mock('@/components/ui/combobox', () => ({
  Combobox: ({
    items,
    onValueChange,
    children,
  }: {
    items: string[]
    onValueChange?: (value: string | null) => void
    children: ReactNode
  }) => {
    currentItems = items
    currentOnValueChange = onValueChange

    return <div>{children}</div>
  },
  ComboboxContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ComboboxEmpty: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ComboboxInput: ({
    showClear: _showClear,
    ...props
  }: ComponentProps<'input'> & { showClear?: boolean }) => <input {...props} />,
  ComboboxItem: ({
    children,
    value,
  }: {
    children: ReactNode
    value: string
  }) => (
    <button type='button' onClick={() => currentOnValueChange?.(value)}>
      {children}
    </button>
  ),
  ComboboxList: ({ children }: { children: (item: string) => ReactNode }) => (
    <div>{currentItems.map((item) => children(item))}</div>
  ),
}))

describe('CategoryPicker', () => {
  const categories: ReferenceCategoryDTO[] = [
    {
      key: 'food',
      kind: 'expense',
      iconUrl: 'https://example.com/icons/food.png',
      color: '#F97316',
    },
    {
      key: 'money-in',
      kind: 'income',
      iconUrl: 'https://example.com/icons/money-in.png',
      color: '#16A34A',
    },
    {
      key: 'shopping',
      kind: 'expense',
      iconUrl: 'https://example.com/icons/shopping.png',
      color: '#A855F7',
    },
  ]

  it('renders only expense categories from mixed catalog', () => {
    render(
      <CategoryPicker
        categories={categories}
        value={null}
        onValueChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: t('app.expenseReference.categories.food'),
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: t('app.expenseReference.categories.shopping'),
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: t('app.expenseReference.categories.money-in'),
      }),
    ).not.toBeInTheDocument()
  })

  it('forwards selected category key through onValueChange', () => {
    const onValueChange = vi.fn()

    render(
      <CategoryPicker
        categories={categories}
        value={null}
        onValueChange={onValueChange}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.expenseReference.categories.shopping'),
      }),
    )

    expect(onValueChange).toHaveBeenCalledWith('shopping')
  })
})
