import { beforeEach, describe, expect, it, vi } from 'vitest'

const viewportCleanup = vi.fn()

let viewportMounted = false

const miniAppBindCssVars = Object.assign(
  vi.fn(() => vi.fn()),
  {
    isAvailable: vi.fn(() => true),
  },
)

const themeBindCssVars = vi.fn(() => vi.fn())
const viewportBindCssVars = vi.fn(() => viewportCleanup)

vi.mock('@tma.js/sdk', () => ({
  miniApp: {
    bindCssVars: miniAppBindCssVars,
  },
  themeParams: {
    bindCssVars: themeBindCssVars,
    isMounted: vi.fn(() => true),
  },
  viewport: {
    bindCssVars: viewportBindCssVars,
    isMounted: vi.fn(() => viewportMounted),
  },
}))

describe('fixed-light platform initialization', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
    viewportMounted = false
    viewportCleanup.mockReset()
    viewportBindCssVars.mockClear()
    miniAppBindCssVars.mockClear()
    themeBindCssVars.mockClear()
    vi.resetModules()
  })

  it('binds viewport safe-area vars after viewport mount and cleans them up', async () => {
    const theme = await import('@/lib/telegram/theme')

    theme.initializeFixedLightPlatform()

    expect(miniAppBindCssVars).not.toHaveBeenCalled()
    expect(themeBindCssVars).not.toHaveBeenCalled()

    expect(viewportBindCssVars).not.toHaveBeenCalled()

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

    expect(viewportCleanup).toHaveBeenCalledTimes(1)

    expect(
      document.documentElement.style.getPropertyValue('--background'),
    ).toBe('#f5f7fb')
  })
})
