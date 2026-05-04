import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BudgetStatusPanel } from '@/components/budget/budget-status-panel'

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

describe('BudgetStatusPanel', () => {
  it('renders loading skeletons', () => {
    const { container } = render(<BudgetStatusPanel isLoading />)

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0)
  })

  it('renders empty state when no status', () => {
    render(<BudgetStatusPanel />)

    expect(screen.getByText('budgets.status.empty.title')).toBeInTheDocument()

    expect(
      screen.getByText('budgets.status.empty.description'),
    ).toBeInTheDocument()
  })

  it('renders error state when request fails', () => {
    render(<BudgetStatusPanel errorMessage='budgets.status.error.loadFailed' />)

    expect(screen.getByText('budgets.status.error.title')).toBeInTheDocument()

    expect(
      screen.getByText('budgets.status.error.loadFailed'),
    ).toBeInTheDocument()
  })
})
