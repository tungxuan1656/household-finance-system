import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProtectedRoute } from '@/components/layouts/protected-route'
import { PublicRoute } from '@/components/layouts/public-route'
import { t } from '@/lib/i18n/t'
import { authActions as storeAuthActions } from '@/stores/auth.store'
import { SignInPage } from '@/views/auth/sign-in-page'

const replaceMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/settings',
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/auth/session-service', () => ({
  signInWithEmailPassword: vi.fn(),
  signOutCurrentSession: vi.fn(),
  signUpWithEmailPassword: vi.fn(),
}))

beforeEach(() => {
  replaceMock.mockClear()
  storeAuthActions.reset()
})

describe('route guards', () => {
  it('renders public children when session is checked and user is anonymous', () => {
    storeAuthActions.markSessionChecked()

    render(
      <PublicRoute>
        <div>public-content</div>
      </PublicRoute>,
    )

    expect(screen.getByText('public-content')).toBeInTheDocument()
  })

  it('hides public children for authenticated users', () => {
    storeAuthActions.setSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        avatarUrl: null,
        displayName: 'Alex Morgan',
        email: 'alex@example.com',
        id: 'user-1',
        provider: 'firebase',
      },
    })

    render(
      <PublicRoute>
        <div>public-content</div>
      </PublicRoute>,
    )

    expect(screen.queryByText('public-content')).not.toBeInTheDocument()
  })

  it('shows restoring session screen for protected routes before hydration check completes', () => {
    render(
      <ProtectedRoute>
        <div>private-content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText(t('auth.session.loadingTitle'))).toBeInTheDocument()
  })

  it('renders protected children for authenticated users', () => {
    storeAuthActions.setSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        avatarUrl: null,
        displayName: 'Alex Morgan',
        email: 'alex@example.com',
        id: 'user-1',
        provider: 'firebase',
      },
    })

    render(
      <ProtectedRoute>
        <div>private-content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('private-content')).toBeInTheDocument()
  })
})

describe('auth screens', () => {
  it('renders sign-in page copy from i18n', () => {
    render(<SignInPage />)

    expect(
      screen.getByText(t('auth.signIn.title'), {
        selector: '[data-slot="card-title"]',
      }),
    ).toBeInTheDocument()
  })
})
