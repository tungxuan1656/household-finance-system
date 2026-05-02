import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ExpenseFeedItem } from '@/components/expense/expense-feed-item'
import type { ExpenseDTO } from '@/types/expense'

const baseExpense: ExpenseDTO = {
  id: '01JTESTFEEDITEM000000000001',
  amountMinor: 1234,
  currencyCode: 'JPY',
  categoryKey: 'food',
  sourceKey: 'cash',
  title: 'Tokyo lunch',
  occurredAt: Date.UTC(2026, 4, 2),
  note: null,
  visibility: 'household',
  householdId: 'hh_test',
  payerUserId: 'user_test',
  createdByUserId: 'user_test',
  createdAt: Date.UTC(2026, 4, 2),
  updatedAt: Date.UTC(2026, 4, 2),
}

describe('ExpenseFeedItem', () => {
  it('formats the amount using the expense currency', () => {
    render(<ExpenseFeedItem expense={baseExpense} />)

    const expectedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'JPY',
    }).format(baseExpense.amountMinor)

    expect(
      screen.getByText((_, element) => element?.textContent === expectedAmount),
    ).toBeInTheDocument()
  })
})
