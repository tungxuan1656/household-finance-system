import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HouseholdDetailPage } from '@/features/households/pages/household-detail-page'

vi.mock('@/features/auth/auth-provider', () => ({
  useAuth: () => ({
    user: { displayName: 'Tung' },
  }),
}))

vi.mock('@/features/households/api', () => ({
  useHouseholdDetailQuery: () => ({
    data: undefined,
    isError: false,
    isLoading: true,
    refetch: vi.fn(),
  }),
  useHouseholdMembersQuery: () => ({
    data: undefined,
    isError: false,
    isLoading: true,
    refetch: vi.fn(),
  }),
  useUpdateHouseholdMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useRemoveHouseholdMemberMutation: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}))

vi.mock('@/features/home/components/home-recent-expenses-section', () => ({
  HomeRecentExpensesSection: () => <section>Chi tiêu gần đây</section>,
}))

vi.mock('@/features/households/components/household-overview-section', () => ({
  HouseholdOverviewSection: () => <section>Tổng quan household</section>,
}))

vi.mock('@/lib/telegram/bottom-button', () => ({
  hideBottomButton: vi.fn(),
}))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: vi.fn(),
  selection: vi.fn(),
}))

describe('HouseholdDetailPage', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;

(
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

  it('renders the loading state without falling through to router not-found', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/households/household-1']}>
          <Routes>
            <Route element={<HouseholdDetailPage />} path='/households/:id' />
            <Route element={<div>Trang bạn mở không tồn tại.</div>} path='*' />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(host.textContent).toContain('Đang tải chi tiết household')
    expect(host.textContent).not.toContain('Trang bạn mở không tồn tại.')
  })
})
