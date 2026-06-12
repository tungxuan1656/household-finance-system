import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PeriodChipLink } from '@/features/period/components/period-chip-link'
import { PeriodPickerPage } from '@/features/period/pages/period-picker-page'
import { usePeriodStore } from '@/features/period/store'
import {
  createCurrentMonthPeriodSelection,
  createReportingPeriodPresetSelection,
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

  it('applies a preset chip into zustand only when BottomButton confirms', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[{ pathname: '/period' }]}>
          <Routes>
            <Route element={<PeriodPickerPage />} path='/period' />
            <Route element={<div>Home</div>} path='/' />
          </Routes>
        </MemoryRouter>,
      )
    })

    const lastWeekPreset = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Tuần trước',
    )

    expect(lastWeekPreset).toBeTruthy()

    await act(async () => {
      lastWeekPreset?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(usePeriodStore.getState().selectedPeriod).toEqual(
      createCurrentMonthPeriodSelection(),
    )

    expect(setBottomButtonMock).toHaveBeenCalledTimes(1)

    const latestBottomButtonOptions = setBottomButtonMock.mock.calls.at(
      -1,
    )?.[0] as { onClick: () => void; text: string } | undefined

    expect(latestBottomButtonOptions?.text).toContain('01/06/26 -> 30/06/26')

    expect(setBottomButtonMock).toHaveBeenCalledTimes(1)

    expect(updateBottomButtonMock).toHaveBeenLastCalledWith({
      enabled: true,
      showProgress: false,
      text: 'Chọn 08/06/26 -> 14/06/26',
    })

    await act(async () => {
      latestBottomButtonOptions?.onClick()
    })

    expect(usePeriodStore.getState().selectedPeriod).toEqual(
      createReportingPeriodPresetSelection(
        'lastWeek',
        new Date('2026-06-15T23:45:00Z'),
      ),
    )
  })

  it('applies the global period when opened through PeriodChipLink', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              element={
                <div>
                  <PeriodChipLink />
                  <span>Home</span>
                </div>
              }
              path='/'
            />
            <Route element={<PeriodPickerPage />} path='/period' />
          </Routes>
        </MemoryRouter>,
      )
    })

    const periodLink = host.querySelector('a[href="/period"]')

    expect(periodLink).toBeTruthy()

    await act(async () => {
      periodLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const lastWeekPreset = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Tuần trước',
    )

    expect(lastWeekPreset).toBeTruthy()

    await act(async () => {
      lastWeekPreset?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const latestBottomButtonOptions = setBottomButtonMock.mock.calls.at(
      -1,
    )?.[0] as { onClick: () => void } | undefined

    await act(async () => {
      latestBottomButtonOptions?.onClick()
    })

    expect(usePeriodStore.getState().selectedPeriod).toEqual(
      createReportingPeriodPresetSelection(
        'lastWeek',
        new Date('2026-06-15T23:45:00Z'),
      ),
    )

    expect(host.textContent).toContain('Home')
  })

  it('returns the chosen period via navigation state when opened as a sub-page and leaves zustand untouched', async () => {
    const initialPeriod = usePeriodStore.getState().selectedPeriod

    let lastLocationState: unknown = undefined

    await act(async () => {
      root.render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/period',
              state: {
                backTo: '/expenses/filter',
                initialPeriod: null,
              },
            },
          ]}>
          <Routes>
            <Route element={<PeriodPickerPage />} path='/period' />
            <Route
              element={
                <CaptureStateProbe
                  onState={(value) => {
                    lastLocationState = value
                  }}
                />
              }
              path='/expenses/filter'
            />
          </Routes>
        </MemoryRouter>,
      )
    })

    const lastMonthPreset = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Tháng trước',
    )

    expect(lastMonthPreset).toBeTruthy()

    await act(async () => {
      lastMonthPreset?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const latestBottomButtonOptions = setBottomButtonMock.mock.calls.at(
      -1,
    )?.[0] as { onClick: () => void; text: string } | undefined

    expect(latestBottomButtonOptions?.onClick).toBeTypeOf('function')

    await act(async () => {
      latestBottomButtonOptions?.onClick()
    })

    expect(usePeriodStore.getState().selectedPeriod).toEqual(initialPeriod)

    expect(lastLocationState).toEqual(
      expect.objectContaining({
        appliedPeriod: expect.objectContaining({
          granularity: expect.stringMatching(/^(week|month|year)$/),
        }),
      }),
    )
  })
})

const CaptureStateProbe = ({
  onState,
}: {
  onState: (state: unknown) => void
}) => {
  const location = useLocation()

  useEffect(() => {
    onState(location.state)
  }, [location.state, onState])

  return <div>Filter</div>
}
