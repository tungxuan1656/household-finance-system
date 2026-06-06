import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GroupDetailPage } from '@/features/groups/pages/group-detail-page'

vi.mock('@/features/groups/api', () => ({
  useExpenseGroupDetailQuery: () => ({
    data: undefined,
    isError: false,
    isLoading: true,
    refetch: vi.fn(),
  }),
  useGroupSummaryQuery: () => ({
    data: undefined,
    isError: false,
    isLoading: true,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/features/home/api', () => ({
  useHouseholdsQuery: () => ({
    data: { items: [] },
  }),
  useExpenseListQuery: () => ({
    data: undefined,
    isError: false,
    isLoading: true,
    refetch: vi.fn(),
  }),
  useReferenceCategoriesQuery: () => ({
    data: undefined,
  }),
}))

vi.mock('@/features/finance/components', () => ({
  RecentExpenses: () => <section>Chi tiêu trong group</section>,
}))

vi.mock('@/lib/telegram/bottom-button', () => ({
  hideBottomButton: vi.fn(),
}))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: vi.fn(),
  selection: vi.fn(),
}))

describe('GroupDetailPage', () => {
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

  it('renders the loading state without falling through to router not-found', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/groups/group-1']}>
          <Routes>
            <Route element={<GroupDetailPage />} path='/groups/:id' />
            <Route element={<div>Trang bạn mở không tồn tại.</div>} path='*' />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(host.textContent).toContain('Đang tải chi tiết group')
    expect(host.textContent).not.toContain('Trang bạn mở không tồn tại.')
  })
})
