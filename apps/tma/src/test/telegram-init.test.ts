import { beforeEach, describe, expect, it, vi } from 'vitest'

const bindTheme = vi.fn()
const resetTheme = vi.fn()
const syncViewportInsets = vi.fn()

const init = vi.fn()
const miniAppReady = vi.fn()
const viewportMount = vi.fn(async () => undefined)

vi.mock('@/lib/telegram/theme', () => ({
  bindTheme,
  DEFAULT_TMA_BG: '#f5f7fb',
  resetTheme,
  syncViewportInsets,
}))

vi.mock('@tma.js/sdk', () => ({
  backButton: {
    isSupported: vi.fn(() => true),
    mount: vi.fn(),
  },
  init,
  initData: {
    restore: vi.fn(),
  },
  mainButton: {
    isMounted: vi.fn(() => false),
    mount: vi.fn(),
  },
  miniApp: {
    mount: vi.fn(),
    ready: { ifAvailable: miniAppReady },
    setBgColor: { ifAvailable: vi.fn() },
    setHeaderColor: { ifAvailable: vi.fn() },
    setBottomBarColor: { ifAvailable: vi.fn() },
  },
  swipeBehavior: {
    mount: vi.fn(),
    disableVertical: { ifAvailable: vi.fn() },
  },
  themeParams: {
    mount: vi.fn(),
  },
  viewport: {
    mount: viewportMount,
    expand: vi.fn(),
    isFullscreen: vi.fn(() => false),
    requestFullscreen: { ifAvailable: vi.fn() },
  },
}))

beforeEach(() => {
  bindTheme.mockReset()
  resetTheme.mockReset()
  syncViewportInsets.mockReset()
  init.mockReset()
  miniAppReady.mockReset()
  viewportMount.mockReset()
})

describe('initTelegramSafely', () => {
  it('captures init errors instead of throwing before React renders', async () => {
    init.mockImplementationOnce(() => {
      throw new Error('launch params missing')
    })

    const { initTelegramSafely } = await import('@/app/bootstrap/telegram-init')
    const result = initTelegramSafely()

    expect(result.error?.message).toContain('launch params missing')
    expect(() => result.cleanup()).not.toThrow()
  })

  it('returns a real cleanup when SDK init succeeds', async () => {
    const cleanup = vi.fn()
    const viewportMountResolver: {
      current: ((value: undefined) => void) | null
    } = {
      current: null,
    }

    init.mockImplementationOnce(() => cleanup)

    viewportMount.mockImplementationOnce(
      () =>
        new Promise<undefined>((resolve) => {
          viewportMountResolver.current = resolve
        }),
    )

    const { initTelegramSafely } = await import('@/app/bootstrap/telegram-init')
    const { DEFAULT_TMA_BG } = await import('@/lib/telegram/theme')
    const result = initTelegramSafely()

    await Promise.resolve()

    expect(result.error).toBeNull()
    expect(bindTheme).toHaveBeenCalledWith(DEFAULT_TMA_BG)
    expect(miniAppReady).not.toHaveBeenCalled()

    if (!viewportMountResolver.current) {
      throw new Error('Viewport mount resolver was not captured')
    }

    viewportMountResolver.current(undefined)
    await Promise.resolve()
    await Promise.resolve()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(miniAppReady).toHaveBeenCalledTimes(1)
    result.cleanup()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})
