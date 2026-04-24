import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import {
  signInWithEmailPassword,
  signOutCurrentSession,
  signUpWithEmailPassword,
} from '@/lib/auth/session-service'
import { t } from '@/lib/i18n'
import { AppRoutes } from '@/router'
import { authActions as storeAuthActions } from '@/stores/auth.store'

vi.mock('@/lib/auth/session-service', async () => {
  return {
    signInWithEmailPassword: vi.fn(async () => {
      storeAuthActions.setSession({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          avatarUrl: null,
          displayName: 'Alex Morgan',
          email: 'tester@example.com',
          id: 'user-1',
          provider: 'firebase',
        },
      })
    }),
    signOutCurrentSession: vi.fn(async () => {
      storeAuthActions.clearSession()
    }),
    signUpWithEmailPassword: vi.fn(async () => {
      storeAuthActions.setSession({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          avatarUrl: null,
          displayName: 'Alex Morgan',
          email: 'tester@example.com',
          id: 'user-1',
          provider: 'firebase',
        },
      })
    }),
  }
})

vi.mock('sonner', () => ({
  Toaster: ({ theme }: { theme?: string }) => (
    <div data-testid='sonner-toaster' data-theme={theme} />
  ),
}))

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  act(() => {
    storeAuthActions.reset()
    storeAuthActions.markSessionChecked()
  })
})

describe('web shell routing', () => {
  it('redirects protected routes back to sign in when shell access is missing', async () => {
    renderAt('/settings')

    expect(
      await screen.findByText(t('auth.signIn.title'), {
        selector: '[data-slot="card-title"]',
      }),
    ).toBeInTheDocument()
  })

  it('routes root through protected flow and redirects unauthenticated users', async () => {
    renderAt('/')

    expect(
      await screen.findByText(t('auth.signIn.title'), {
        selector: '[data-slot="card-title"]',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: t('auth.signIn.footer.link') }),
    ).toBeInTheDocument()
  })

  it('renders the sign-up page at the public route', () => {
    renderAt('/sign-up')

    expect(
      screen.getByText(t('auth.signUp.title'), {
        selector: '[data-slot="card-title"]',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(t('auth.signUp.fields.fullName.label')),
    ).toBeInTheDocument()
  })

  it('renders the protected shell when a session is already available', () => {
    act(() => {
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
    })

    renderAt('/')

    expect(
      screen.getByRole('heading', { name: t('app.overview.title') }),
    ).toBeInTheDocument()
  })

  it('grants shell access when the sign-in form is submitted', async () => {
    const user = userEvent.setup()

    renderAt('/sign-in')

    await user.type(
      screen.getByLabelText(t('auth.signIn.fields.email.label')),
      'tester@example.com',
    )

    await user.type(
      screen.getByLabelText(t('auth.signIn.fields.password.label')),
      'password123',
    )

    await user.click(
      screen.getByRole('button', { name: t('common.actions.signIn') }),
    )

    expect(signInWithEmailPassword).toHaveBeenCalledWith({
      email: 'tester@example.com',
      password: 'password123',
    })

    expect(
      await screen.findByRole('heading', { name: t('app.overview.title') }),
    ).toBeInTheDocument()
  })

  it('shows the onboarding flow after sign up', async () => {
    const user = userEvent.setup()

    renderAt('/sign-up')

    await user.type(
      screen.getByLabelText(t('auth.signUp.fields.fullName.label')),
      'Alex Morgan',
    )

    await user.type(
      screen.getByLabelText(t('auth.signUp.fields.email.label')),
      'tester@example.com',
    )

    await user.type(
      screen.getByLabelText(t('auth.signUp.fields.password.label')),
      'password123',
    )

    await user.click(
      screen.getByRole('button', { name: t('common.actions.createAccount') }),
    )

    expect(signUpWithEmailPassword).toHaveBeenCalledWith({
      email: 'tester@example.com',
      name: 'Alex Morgan',
      password: 'password123',
    })

    expect(
      await screen.findByText(t('app.onboarding.title'), {
        selector: 'h1',
      }),
    ).toBeInTheDocument()
  })

  it('redirects authenticated users away from public auth pages', async () => {
    act(() => {
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
    })

    renderAt('/sign-in')

    expect(
      await screen.findByRole('heading', { name: t('app.overview.title') }),
    ).toBeInTheDocument()
  })

  it('shows translated validation feedback when sign-in input is invalid', async () => {
    const user = userEvent.setup()

    renderAt('/sign-in')

    await user.click(
      screen.getByRole('button', { name: t('common.actions.signIn') }),
    )

    expect(
      screen.getAllByText(t('auth.signIn.errors.invalidForm')),
    ).toHaveLength(2)
  })

  it('signs out and returns to the sign-in page', async () => {
    const user = userEvent.setup()

    act(() => {
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
    })

    renderAt('/')

    await user.click(
      screen.getByRole('button', { name: t('common.actions.signOut') }),
    )

    expect(signOutCurrentSession).toHaveBeenCalled()

    expect(
      await screen.findByText(t('auth.signIn.title'), {
        selector: '[data-slot="card-title"]',
      }),
    ).toBeInTheDocument()
  })

  it('passes the local theme value into the toaster', () => {
    render(
      <ThemeProvider defaultTheme='dark'>
        <Toaster />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('sonner-toaster')).toHaveAttribute(
      'data-theme',
      'dark',
    )
  })

  it('renders the 404 page for unknown routes and links back to home', () => {
    renderAt('/this-route-does-not-exist')

    expect(screen.getByRole('heading', { name: 'Whoops!' })).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Back to home page' }),
    ).toHaveAttribute('href', '/')
  })
})
