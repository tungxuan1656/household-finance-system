import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { removeLocalStorageItem } from '@/lib/storages/browser-storage'

afterEach(() => {
  removeLocalStorageItem('appLanguage')
  document.documentElement.lang = ''
  vi.restoreAllMocks()
})

describe('frontend i18n bootstrap', () => {
  it('falls back to vi at render time when the browser language is unsupported', async () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('fr-FR')

    vi.resetModules()

    const { AppRoutes } = await import('@/router')
    const { t } = await import('@/lib/i18n')

    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: t('auth.signIn.title') }),
    ).toBeInTheDocument()
  })
})
