import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  canUseRouterBack,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'

let backHandler: (() => void) | null = null

vi.mock('@/lib/telegram/back-button', () => ({
  hideBackButton: vi.fn(),
  showBackButton: vi.fn((onClick: () => void) => {
    backHandler = onClick

    return () => {
      backHandler = null
    }
  }),
}))

vi.mock('@/lib/telegram/bottom-button', () => ({
  hideBottomButton: vi.fn(),
}))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: vi.fn(),
  selection: vi.fn(),
}))

const ListPage = () => (
  <TmaPageShell showBottomTabs={false} title='Danh sach'>
    <div>List page</div>
  </TmaPageShell>
)

const DetailPage = ({ backTo }: { backTo?: string }) => (
  <TmaPageShell
    showBackButton
    backTo={backTo}
    showBottomTabs={false}
    title='Chi tiet'>
    <div>Detail page</div>
  </TmaPageShell>
)

describe('TmaPageShell navigation', () => {
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
    backHandler = null
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })

    host.remove()
    window.history.replaceState(null, '', '/')
    backHandler = null
  })

  it('uses router back only when React Router history idx is positive', () => {
    expect(canUseRouterBack({ idx: 1 })).toBe(true)
    expect(canUseRouterBack({ idx: 0 })).toBe(false)
    expect(canUseRouterBack({})).toBe(false)
    expect(canUseRouterBack(null)).toBe(false)
  })

  it('goes back within the SPA when router history idx is positive', async () => {
    window.history.replaceState({ idx: 1 }, '', '/detail')

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/', '/detail']} initialIndex={1}>
          <Routes>
            <Route element={<ListPage />} path='/' />
            <Route element={<DetailPage backTo='/' />} path='/detail' />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(document.body.textContent).toContain('Detail page')
    expect(backHandler).not.toBeNull()

    await act(async () => {
      backHandler?.()
    })

    expect(document.body.textContent).toContain('List page')
  })

  it('uses backTo replacement instead of browser-history length fallback on cold detail entry', async () => {
    window.history.replaceState({ idx: 0 }, '', '/detail')

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/detail']}>
          <Routes>
            <Route element={<ListPage />} path='/' />
            <Route element={<DetailPage backTo='/' />} path='/detail' />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(document.body.textContent).toContain('Detail page')
    expect(backHandler).not.toBeNull()

    await act(async () => {
      backHandler?.()
    })

    expect(document.body.textContent).toContain('List page')
  })
})
