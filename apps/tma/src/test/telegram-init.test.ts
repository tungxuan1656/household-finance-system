import { describe, expect, it, vi } from 'vitest'

const bindTheme = vi.fn()
const resetTheme = vi.fn()
const syncViewportInsets = vi.fn()

const init = vi.fn()

vi.mock('@/lib/telegram/theme', () => ({
  bindTheme,
  resetTheme,
  syncViewportInsets,
}))

vi.mock('@tma.js/sdk', () => ({
  init,
  initData: {
    restore: vi.fn(),
  },
  miniApp: {
    mount: vi.fn(),
    ready: { ifAvailable: vi.fn() },
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
    mount: vi.fn(async () => undefined),
    expand: vi.fn(),
    isFullscreen: vi.fn(() => false),
    requestFullscreen: { ifAvailable: vi.fn() },
  },
}))

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
    init.mockImplementationOnce(() => cleanup)

    const { initTelegramSafely } = await import('@/app/bootstrap/telegram-init')
    const result = initTelegramSafely()

    expect(result.error).toBeNull()
    result.cleanup()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})
