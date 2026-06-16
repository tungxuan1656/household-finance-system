import { act, createRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DatePicker } from '@/components/ui/date-picker'

const { impactMock } = vi.hoisted(() => ({ impactMock: vi.fn() }))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: impactMock,
  notification: vi.fn(),
  selection: vi.fn(),
}))

const setNativeValue = (input: HTMLInputElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set

  valueSetter?.call(input, value)
}

const queryInput = (host: HTMLDivElement, type = 'date') =>
  host.querySelector(`input[type="${type}"]`) as HTMLInputElement | null

const queryButton = (host: HTMLDivElement) =>
  host.querySelector('button') as HTMLButtonElement | null

describe('DatePicker', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    const globalWithAct = globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean
    }

    globalWithAct.IS_REACT_ACT_ENVIRONMENT = true
    impactMock.mockClear()

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

  it('renders the value as dd/MM/yyyy on the visual button', async () => {
    await act(async () => {
      root.render(
        <DatePicker
          aria-label='Chọn ngày'
          value='2026-06-15'
          onChange={() => {}}
        />,
      )
    })

    const button = queryButton(host)

    expect(button).toBeTruthy()
    expect(button?.getAttribute('aria-hidden')).toBe('true')
    expect(button?.textContent).toContain('15/06/2026')

    const input = queryInput(host)

    expect(input).toBeTruthy()
    expect(input?.getAttribute('aria-label')).toBe('Chọn ngày')
    expect(input?.value).toBe('2026-06-15')
    expect(input?.className).toContain('opacity-0')
    expect(input?.className).not.toContain('pointer-events-none')
    expect(button?.className).toContain('pointer-events-none')
  })

  it('falls back to the placeholder when the value is empty', async () => {
    await act(async () => {
      root.render(
        <DatePicker
          aria-label='Chọn ngày'
          placeholder='Pick a date'
          value=''
          onChange={() => {}}
        />,
      )
    })

    expect(host.textContent).toContain('Pick a date')
  })

  it('triggers a light haptic and forwards the input ref when the picker is clicked', async () => {
    const inputRef = createRef<HTMLInputElement>()

    await act(async () => {
      root.render(
        <DatePicker
          ref={inputRef}
          aria-label='Chọn ngày'
          value='2026-06-15'
          onChange={() => {}}
        />,
      )
    })

    const input = queryInput(host)

    expect(input).toBeTruthy()
    expect(inputRef.current).toBe(input)

    await act(async () => {
      input?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(impactMock).toHaveBeenCalledWith('light')
  })

  it('forwards onChange with the new ISO yyyy-MM-dd value', async () => {
    const onChange = vi.fn()

    await act(async () => {
      root.render(
        <DatePicker
          aria-label='Chọn ngày'
          value='2026-06-15'
          onChange={onChange}
        />,
      )
    })

    const input = queryInput(host)

    expect(input).toBeTruthy()

    await act(async () => {
      setNativeValue(input as HTMLInputElement, '2026-12-31')
      input?.dispatchEvent(new Event('input', { bubbles: true }))
      input?.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onChange).toHaveBeenCalledWith('2026-12-31')
  })

  it('hides the calendar icon when showIcon is false', async () => {
    await act(async () => {
      root.render(
        <DatePicker
          aria-label='Chọn ngày'
          showIcon={false}
          value='2026-06-15'
          onChange={() => {}}
        />,
      )
    })

    const button = queryButton(host)
    const svg = button?.querySelector('svg')

    expect(svg).toBeNull()
  })

  it('matches the button width when fullWidth is true', async () => {
    await act(async () => {
      root.render(
        <div className='w-72'>
          <DatePicker
            fullWidth
            aria-label='Chọn ngày'
            value='2026-06-15'
            onChange={() => {}}
          />
        </div>,
      )
    })

    const button = queryButton(host)

    expect(button?.className).toContain('w-full')
  })

  it('renders month picker with localized label and month input type when mode is month', async () => {
    await act(async () => {
      root.render(
        <DatePicker
          aria-label='Chọn tháng'
          mode='month'
          value='2026-06'
          onChange={() => {}}
        />,
      )
    })

    const button = queryButton(host)
    const input = queryInput(host, 'month')

    expect(button?.textContent).toContain('tháng 6 năm 2026')
    expect(input).toBeTruthy()
    expect(input?.value).toBe('2026-06')
  })

  it('forwards onChange with the YYYY-MM value in month mode', async () => {
    const onChange = vi.fn()

    await act(async () => {
      root.render(
        <DatePicker
          aria-label='Chọn tháng'
          mode='month'
          value='2026-06'
          onChange={onChange}
        />,
      )
    })

    const input = queryInput(host, 'month')

    expect(input).toBeTruthy()

    await act(async () => {
      setNativeValue(input as HTMLInputElement, '2026-12')
      input?.dispatchEvent(new Event('input', { bubbles: true }))
      input?.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onChange).toHaveBeenCalledWith('2026-12')
  })
})
