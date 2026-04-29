import { render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { removeLocalStorageItem } from '@/lib/storages/browser-storage'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}))

afterEach(() => {
  removeLocalStorageItem('appLanguage')
  document.documentElement.lang = ''
  vi.restoreAllMocks()
})

describe('frontend i18n bootstrap', () => {
  it('falls back to vi at render time when browser language is unsupported', async () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('fr-FR')

    vi.resetModules()

    const { SignInPage } = await import('@/views/auth/sign-in-page')
    const { t } = await import('./t')

    render(<SignInPage />)

    expect(
      await screen.findByText(t('auth.signIn.title'), {
        selector: '[data-slot="card-title"]',
      }),
    ).toBeInTheDocument()
  })
})
