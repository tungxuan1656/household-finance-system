import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HouseholdListPage } from '@/features/households/pages/household-list-page'
import { HomePage } from '@/routes/home'

vi.mock('@/features/auth/auth-provider', () => ({
  useAuth: () => ({
    user: {
      displayName: 'Tung',
      email: 'tung@example.com',
      avatarUrl: null,
    },
  }),
}))

vi.mock('@/features/home/components/home-overview-section', () => ({
  HomeOverviewSection: () => <section>Tổng quan</section>,
}))

vi.mock('@/features/home/components/home-shortcuts-section', () => ({
  HomeShortcutsSection: () => <section>Shortcut</section>,
}))

vi.mock('@/features/home/components/home-households-section', () => ({
  HomeHouseholdsSection: () => <section>Households</section>,
}))

vi.mock('@/features/home/components/home-recent-expenses-section', () => ({
  HomeRecentExpensesSection: () => <section>Recent expenses</section>,
}))

vi.mock('@/features/households/api', () => ({
  useHouseholdBudgetQueries: () => [],
  useHouseholdListQuery: () => ({
    data: { items: [] },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useHouseholdMemberQueries: () => [],
  useHouseholdOverviewQueries: () => [],
}))

vi.mock('@/lib/telegram/bottom-button', () => ({
  hideBottomButton: vi.fn(),
}))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: vi.fn(),
  selection: vi.fn(),
}))

describe('period chip entrypoints', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;

(
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean
      }
    ).IS_REACT_ACT_ENVIRONMENT = true

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T23:45:00Z'))

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(async () => {
    vi.useRealTimers()

    await act(async () => {
      root.unmount()
    })

    host.remove()
  })

  it('renders a shared period chip link on the home page', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>,
      )
    })

    const periodLink = host.querySelector('a[href="/period"]')

    expect(periodLink?.textContent).toBe('06/26')
  })

  it('renders a shared period chip link on the household list page', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <HouseholdListPage />
        </MemoryRouter>,
      )
    })

    const periodLink = host.querySelector('a[href="/period"]')

    expect(periodLink?.textContent).toBe('06/26')
  })
})
