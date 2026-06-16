import { act, createRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NativePicker } from '@/components/ui/native-picker'

const { impactMock } = vi.hoisted(() => ({ impactMock: vi.fn() }))

vi.mock('@/lib/telegram/haptics', () => ({
  impact: impactMock,
  notification: vi.fn(),
  selection: vi.fn(),
}))

const setNativeValue = (select: HTMLSelectElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value',
  )?.set

  valueSetter?.call(select, value)
}

const querySelect = (host: HTMLDivElement) =>
  host.querySelector('select') as HTMLSelectElement | null

const queryButton = (host: HTMLDivElement) =>
  host.querySelector('button') as HTMLButtonElement | null

const SAMPLE_OPTIONS = [
  { label: 'Cá nhân', value: 'personal' },
  { label: 'Household A', value: 'h-1' },
  { label: 'Household B', value: 'h-2' },
]

describe('NativePicker', () => {
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

  it('renders the selected option label on the visual button', async () => {
    await act(async () => {
      root.render(
        <NativePicker
          aria-label='Chọn phạm vi'
          options={SAMPLE_OPTIONS}
          value='h-1'
          onChange={() => {}}
        />,
      )
    })

    const button = queryButton(host)
    const select = querySelect(host)

    expect(button).toBeTruthy()
    expect(button?.getAttribute('aria-hidden')).toBe('true')
    expect(button?.textContent).toContain('Household A')

    expect(select).toBeTruthy()
    expect(select?.getAttribute('aria-label')).toBe('Chọn phạm vi')
    expect(select?.value).toBe('h-1')
    expect(select?.className).toContain('opacity-0')
    expect(select?.className).not.toContain('pointer-events-none')
    expect(button?.className).toContain('pointer-events-none')
  })

  it('falls back to the placeholder when no option matches', async () => {
    await act(async () => {
      root.render(
        <NativePicker
          aria-label='Chọn phạm vi'
          options={SAMPLE_OPTIONS}
          placeholder='Chưa chọn'
          value=''
          onChange={() => {}}
        />,
      )
    })

    expect(host.textContent).toContain('Chưa chọn')
  })

  it('triggers a light haptic and forwards the select ref when the picker is clicked', async () => {
    const selectRef = createRef<HTMLSelectElement>()

    await act(async () => {
      root.render(
        <NativePicker
          ref={selectRef}
          aria-label='Chọn phạm vi'
          options={SAMPLE_OPTIONS}
          value='personal'
          onChange={() => {}}
        />,
      )
    })

    const select = querySelect(host)

    expect(select).toBeTruthy()
    expect(selectRef.current).toBe(select)

    await act(async () => {
      select?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(impactMock).toHaveBeenCalledWith('light')
  })

  it('forwards onChange with the new option value', async () => {
    const onChange = vi.fn()

    await act(async () => {
      root.render(
        <NativePicker
          aria-label='Chọn phạm vi'
          options={SAMPLE_OPTIONS}
          value='personal'
          onChange={onChange}
        />,
      )
    })

    const select = querySelect(host)

    expect(select).toBeTruthy()

    await act(async () => {
      setNativeValue(select as HTMLSelectElement, 'h-2')
      select?.dispatchEvent(new Event('input', { bubbles: true }))
      select?.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onChange).toHaveBeenCalledWith('h-2')
  })

  it('hides the chevron icon when showIcon is false', async () => {
    await act(async () => {
      root.render(
        <NativePicker
          aria-label='Chọn phạm vi'
          options={SAMPLE_OPTIONS}
          showIcon={false}
          value='personal'
          onChange={() => {}}
        />,
      )
    })

    const button = queryButton(host)
    const svg = button?.querySelector('svg')

    expect(svg).toBeNull()
  })

  it('fills the wrapper width when fullWidth is true', async () => {
    await act(async () => {
      root.render(
        <div className='w-72'>
          <NativePicker
            fullWidth
            aria-label='Chọn phạm vi'
            options={SAMPLE_OPTIONS}
            value='personal'
            onChange={() => {}}
          />
        </div>,
      )
    })

    const button = queryButton(host)

    expect(button?.className).toContain('w-full')
    expect(button?.className).toContain('overflow-hidden')
  })

  it('renders one option element per provided option', async () => {
    await act(async () => {
      root.render(
        <NativePicker
          aria-label='Chọn phạm vi'
          options={SAMPLE_OPTIONS}
          value='personal'
          onChange={() => {}}
        />,
      )
    })

    const select = querySelect(host)
    const optionElements = select?.querySelectorAll('option')

    expect(optionElements?.length).toBe(SAMPLE_OPTIONS.length)
  })
})
