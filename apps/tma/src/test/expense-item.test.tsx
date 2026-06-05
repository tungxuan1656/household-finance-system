import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ExpenseItem } from '@/features/finance/components'
import type { ExpenseDTO, ReferenceCategoryDTO } from '@/features/home/types'

vi.mock('@/lib/telegram/haptics', () => ({
  selection: vi.fn(),
}))

const expense: ExpenseDTO = {
  amountMinor: 12_345,
  categoryKey: 'food',
  createdAt: 1_780_000_000_000,
  currencyCode: 'USD',
  groupIds: ['group-1'],
  householdId: 'household-1',
  id: 'expense-1',
  note: 'Do not show this note in history rows.',
  occurredAt: new Date('2026-06-05T04:10:00.000Z').getTime(),
  sourceKey: 'cash',
  spentByUserId: 'user-1',
  title: 'Market basket',
  updatedAt: 1_780_000_000_000,
}

const categories: ReferenceCategoryDTO[] = [
  {
    color: '#F97316',
    iconUrl: 'https://example.com/food.png',
    key: 'food',
    kind: 'expense',
  },
]

describe('ExpenseItem', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean
      }
    ).IS_REACT_ACT_ENVIRONMENT = true

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })

    host.remove()
  })

  it('renders history rows with API category icon and without note or time', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ExpenseItem
            expense={expense}
            householdLabel='Demo Household'
            referenceCategories={categories}
          />
        </MemoryRouter>,
      )
    })

    const icon = host.querySelector('img')

    expect(icon?.getAttribute('src')).toBe('https://example.com/food.png')
    expect(host.textContent).toContain('Ăn uống')
    expect(host.textContent).toContain('Market basket')
    expect(host.textContent).toContain('Demo Household')
    expect(host.textContent).toContain('1 nhóm')
    expect(host.textContent).not.toContain('Do not show this note')
    expect(host.textContent).not.toContain('04:10')
  })
})
