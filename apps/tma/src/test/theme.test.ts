import { beforeEach, describe, expect, it, vi } from 'vitest'

const miniAppCleanup = vi.fn()
const themeCleanup = vi.fn()
const viewportCleanup = vi.fn()

let viewportMounted = false

const miniAppBindCssVars = vi.fn(() => miniAppCleanup)

;(
  miniAppBindCssVars as typeof miniAppBindCssVars & {
    isAvailable: ReturnType<typeof vi.fn>
  }
).isAvailable = vi.fn(() => true)

const themeBindCssVars = vi.fn(() => themeCleanup)
const viewportBindCssVars = vi.fn(() => viewportCleanup)

vi.mock('@tma.js/sdk', () => ({
  miniApp: {
    bindCssVars: miniAppBindCssVars,
  },
  themeParams: {
    bindCssVars: themeBindCssVars,
    bgColor: vi.fn(() => '#123456'),
    isMounted: vi.fn(() => true),
  },
  viewport: {
    bindCssVars: viewportBindCssVars,
    isMounted: vi.fn(() => viewportMounted),
  },
}))

describe('theme binding', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
    viewportMounted = false
    miniAppCleanup.mockReset()
    themeCleanup.mockReset()
    viewportCleanup.mockReset()
    miniAppBindCssVars.mockClear()
    themeBindCssVars.mockClear()
    viewportBindCssVars.mockClear()
    vi.resetModules()
  })

  it('binds theme vars immediately and viewport vars after viewport mount', async () => {
    const theme = await import('@/lib/telegram/theme')

    theme.bindTheme()

    expect(miniAppBindCssVars).toHaveBeenCalledTimes(1)
    expect(themeBindCssVars).toHaveBeenCalledTimes(1)
    expect(viewportBindCssVars).not.toHaveBeenCalled()

    expect(
      document.documentElement.style.getPropertyValue('--tma-base-bg'),
    ).toBe('#123456')

    viewportMounted = true
    theme.syncViewportInsets()

    expect(viewportBindCssVars).toHaveBeenCalledTimes(1)

    const mapper = (
      viewportBindCssVars as typeof viewportBindCssVars & {
        mock: { calls: Array<[unknown]> }
      }
    ).mock.calls[0]?.[0] as ((key: string) => string | null) | undefined
    expect(mapper?.('safeAreaInsetTop')).toBe('--tma-safe-top')

    expect(mapper?.('contentSafeAreaInsetBottom')).toBe(
      '--tma-content-safe-bottom',
    )

    expect(mapper?.('width')).toBeNull()

    theme.resetTheme()

    expect(miniAppCleanup).toHaveBeenCalledTimes(1)
    expect(themeCleanup).toHaveBeenCalledTimes(1)
    expect(viewportCleanup).toHaveBeenCalledTimes(1)

    expect(
      document.documentElement.style.getPropertyValue('--tma-base-bg'),
    ).toBe('')
  })
})
