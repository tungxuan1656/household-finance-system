import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PeriodPickerPage } from '@/features/period/pages/period-picker-page'
import { usePeriodStore } from '@/features/period/store'
import {
  createCurrentMonthPeriodSelection,
  createWeekPeriodSelection,
} from '@/lib/period'

const { setBottomButtonMock } = vi.hoisted(() => ({
  setBottomButtonMock: vi.fn(
    (_options: {
      enabled: boolean
      onClick: () => void
      showProgress: boolean
      text: string
    }) => vi.fn(),
  ),
}))
const { updateBottomButtonMock } = vi.hoisted(() => ({
  updateBottomButtonMock: vi.fn(),
}))

vi.mock('@/lib/telegram/bottom-button', () => ({
  hideBottomButton: vi.fn(),
  setBottomButton: setBottomButtonMock,
  updateBottomButton: updateBottomButtonMock,
}))

vi.mock('@/lib/telegram/haptics', () => ({
  selection: vi.fn(),
}))

describe('period store and picker', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean
      }
    ).IS_REACT_ACT_ENVIRONMENT = true

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T23:45:00Z'))
    setBottomButtonMock.mockClear()
    updateBottomButtonMock.mockClear()
    usePeriodStore.getState().reset()

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

  it('defaults the selected period store to the current month range', () => {
    expect(usePeriodStore.getState().selectedPeriod).toEqual(
      createCurrentMonthPeriodSelection(),
    )
  })

  it('applies the picker draft into zustand only when BottomButton confirms', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter
          initialEntries={[{ pathname: '/period', state: { backTo: '/' } }]}>
          <Routes>
            <Route element={<PeriodPickerPage />} path='/period' />
            <Route element={<div>Home</div>} path='/' />
          </Routes>
        </MemoryRouter>,
      )
    })

    const weekTab = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Tuần',
    )

    expect(weekTab).toBeTruthy()

    await act(async () => {
      weekTab?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(usePeriodStore.getState().selectedPeriod).toEqual(
      createCurrentMonthPeriodSelection(),
    )

    expect(setBottomButtonMock).toHaveBeenCalledTimes(1)

    const yearList = host.querySelector('[data-testid="period-year-list"]')
    const valueList = host.querySelector('[data-testid="period-value-list"]')

    expect(yearList).toBeTruthy()
    expect(valueList).toBeTruthy()

    const latestBottomButtonOptions = setBottomButtonMock.mock.calls.at(
      -1,
    )?.[0] as { onClick: () => void; text: string } | undefined

    expect(latestBottomButtonOptions?.text).toContain('01/06/26 - 30/06/26')

    expect(setBottomButtonMock).toHaveBeenCalledTimes(1)

    expect(updateBottomButtonMock).toHaveBeenLastCalledWith({
      enabled: true,
      showProgress: false,
      text: 'Chọn 29/12/25 - 04/01/26',
    })

    await act(async () => {
      latestBottomButtonOptions?.onClick()
    })

    expect(usePeriodStore.getState().selectedPeriod).toEqual(
      createWeekPeriodSelection(2026, 1),
    )
  })
})
