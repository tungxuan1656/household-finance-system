import type { ExpenseRow, ListExpensesInput } from './expense-repository'

export type ExpenseCursor =
  | { sort: 'occurred_at_desc'; occurredAt: number; id: string }
  | {
      sort: 'amount_desc'
      amountMinor: number
      occurredAt: number
      id: string
    }

export const decodeCursor = (cursor: string): ExpenseCursor | null => {
  try {
    const decoded = atob(cursor)
    const parts = decoded.split(':')

    if (parts.length === 2) {
      const occurredAt = Number(parts[0])
      const id = parts[1]

      if (!occurredAt || !id) return null

      return { sort: 'occurred_at_desc', occurredAt, id }
    }

    if (parts.length === 3) {
      const amountMinor = Number(parts[0])
      const occurredAt = Number(parts[1])
      const id = parts[2]

      if (Number.isNaN(amountMinor) || !occurredAt || !id) return null

      return { sort: 'amount_desc', amountMinor, occurredAt, id }
    }

    return null
  } catch {
    return null
  }
}

export const encodeCursor = (
  sort: ListExpensesInput['sort'],
  expense: Pick<ExpenseRow, 'amount_minor' | 'occurred_at' | 'id'>,
): string =>
  sort === 'amount_desc'
    ? btoa(`${expense.amount_minor}:${expense.occurred_at}:${expense.id}`)
    : btoa(`${expense.occurred_at}:${expense.id}`)
