import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ExpenseDetailCard } from '@/components/expense/expense-detail-card'
import type { ExpenseDTO } from '@/types/expense'

const baseExpense: ExpenseDTO = {
  id: '01JTESTDETAILCARD0000000001',
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

describe('ExpenseDetailCard', () => {
  it('formats the amount using the expense currency', () => {
    render(<ExpenseDetailCard expense={baseExpense} />)

    const expectedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'JPY',
    }).format(baseExpense.amountMinor)

    expect(
      screen.getByText((_, element) => element?.textContent === expectedAmount),
    ).toBeInTheDocument()
  })
})
