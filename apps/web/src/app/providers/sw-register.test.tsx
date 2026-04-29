import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SwRegister } from '@/app/providers/sw-register'

const restoreBrowserGlobals = () => {
  Reflect.deleteProperty(navigator, 'serviceWorker')
  Reflect.deleteProperty(globalThis, 'caches')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  restoreBrowserGlobals()
})

describe('SwRegister', () => {
  it('cleans up stale service workers and caches in development', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    const unregister = vi.fn().mockResolvedValue(undefined)
    const getRegistrations = vi.fn().mockResolvedValue([{ unregister }])
    const register = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistrations,
        register,
      },
    })

    const keys = vi.fn().mockResolvedValue(['hfs-static-v1'])
    const deleteCache = vi.fn().mockResolvedValue(true)

    vi.stubGlobal('caches', {
      delete: deleteCache,
      keys,
    })

    render(<SwRegister />)

    await waitFor(() => expect(getRegistrations).toHaveBeenCalledTimes(1))

    expect(register).not.toHaveBeenCalled()
    expect(unregister).toHaveBeenCalledTimes(1)
    expect(keys).toHaveBeenCalledTimes(1)
    expect(deleteCache).toHaveBeenCalledWith('hfs-static-v1')
  })

  it('registers the production service worker', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const register = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistrations: vi.fn(),
        register,
      },
    })

    render(<SwRegister />)

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      }),
    )
  })
})
