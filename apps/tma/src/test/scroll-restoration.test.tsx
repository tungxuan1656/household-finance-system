import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RootLayout from '@/app/router/root-layout'
import { resetSavedScrollPositionsForTests } from '@/app/router/use-container-scroll-restoration'
import { TmaPageShell } from '@/components/shared/tma-page-shell'

vi.mock('@/lib/telegram/back-button', () => ({
  hideBackButton: vi.fn(),
  showBackButton: vi.fn(() => () => undefined),
}))

vi.mock('@/lib/telegram/bottom-button', () => ({
  hideBottomButton: vi.fn(),
}))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: vi.fn(),
  selection: vi.fn(),
}))

const ListPage = () => (
  <TmaPageShell title='Danh sach'>
    <div style={{ height: '2000px' }}>Danh sach chi tieu</div>
  </TmaPageShell>
)

const DetailPage = () => (
  <TmaPageShell title='Chi tiet'>
    <div style={{ height: '2000px' }}>Chi tiet chi tieu</div>
  </TmaPageShell>
)

const NavigationHarness = () => {
  const navigate = useNavigate()

  return (
    <div>
      <button type='button' onClick={() => navigate('/detail')}>
        Open detail
      </button>
      <button type='button' onClick={() => navigate(-1)}>
        Go back
      </button>
    </div>
  )
}

const getScrollContainer = (): HTMLElement => {
  const container = document.querySelector<HTMLElement>(
    '.tma-page-shell__content',
  )

  if (!container) {
    throw new Error('Scroll container was not rendered')
  }

  return container
}

describe('TMA scroll restoration', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean
      }
    ).IS_REACT_ACT_ENVIRONMENT = true

    resetSavedScrollPositionsForTests()

    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)

    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value(options: ScrollToOptions | number, y?: number) {
        if (typeof options === 'number') {
          this.scrollTop = y ?? 0

          return
        }

        this.scrollTop = options.top ?? 0
      },
    })
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })

    host.remove()
  })

  it('restores the page-shell scroll position when navigating back', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <NavigationHarness />
          <Routes>
            <Route element={<RootLayout />} path='/'>
              <Route index element={<ListPage />} />
              <Route element={<DetailPage />} path='detail' />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
    })

    const listContainer = getScrollContainer()
    listContainer.scrollTop = 240
    listContainer.dispatchEvent(new Event('scroll'))

    const openDetailButton = document.querySelector<HTMLButtonElement>(
      'button:nth-of-type(1)',
    )

    if (!openDetailButton) {
      throw new Error('Open detail button was not rendered')
    }

    await act(async () => {
      openDetailButton.click()
    })

    const detailContainer = getScrollContainer()
    expect(detailContainer.scrollTop).toBe(0)

    const goBackButton = document.querySelector<HTMLButtonElement>(
      'button:nth-of-type(2)',
    )

    if (!goBackButton) {
      throw new Error('Go back button was not rendered')
    }

    await act(async () => {
      goBackButton.click()
    })

    const restoredListContainer = getScrollContainer()
    expect(restoredListContainer.scrollTop).toBe(240)
  })
})
