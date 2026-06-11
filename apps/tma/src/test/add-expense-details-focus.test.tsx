import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAddExpenseFlowStore } from '@/features/expenses/store'
import { AddExpenseDetailsPage } from '@/routes/add-expense-details'

vi.mock('@/lib/telegram/bottom-button', () => ({
  hideBottomButton: vi.fn(),
  setBottomButton: vi.fn(() => vi.fn()),
  updateBottomButton: vi.fn(),
}))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: vi.fn(),
  notification: vi.fn(),
  selection: vi.fn(),
}))

describe('AddExpenseDetailsPage focus', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;

(
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean
      }
    ).IS_REACT_ACT_ENVIRONMENT = true

    useAddExpenseFlowStore.getState().reset()

    useAddExpenseFlowStore.getState().selectCategory({
      id: 'food',
      label: 'An uong',
      symbol: 'AU',
      accent: { background: '#edf4ff', foreground: '#3f7cff' },
    })

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

  it('focuses the amount input when step 2 mounts', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/expenses/new/details']}>
          <Routes>
            <Route
              element={<AddExpenseDetailsPage />}
              path='/expenses/new/details'
            />
          </Routes>
        </MemoryRouter>,
      )
    })

    const amountInput = host.querySelector<HTMLInputElement>(
      'input[inputmode="numeric"]',
    )

    expect(amountInput).toBeTruthy()
    expect(document.activeElement).toBe(amountInput)
  })
})
