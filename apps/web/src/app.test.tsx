import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { t } from '@/lib/i18n'
import { AppRoutes } from '@/router'
import { authActions } from '@/stores/auth.store'

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
    authActions.reset()
  })
})

describe('web shell routing', () => {
  it('redirects protected routes back to sign in when shell access is missing', async () => {
    renderAt('/app')

    expect(
      await screen.findByRole('heading', { name: t('auth.signIn.title') }),
    ).toBeInTheDocument()
  })

  it('redirects the root route to sign in', async () => {
    renderAt('/')

    expect(
      await screen.findByRole('heading', { name: t('auth.signIn.title') }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: t('auth.signIn.footer.link') }),
    ).toBeInTheDocument()
  })

  it('renders the sign-up page at the public route', () => {
    renderAt('/sign-up')

    expect(
      screen.getByRole('heading', { name: t('auth.signUp.title') }),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(t('auth.signUp.fields.fullName.label')),
    ).toBeInTheDocument()
  })

  it('renders the protected shell and onboarding placeholder', async () => {
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

    expect(
      screen.getByRole('heading', { name: t('app.overview.title') }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('link', { name: t('shell.protected.nav.onboarding') }),
    )

    expect(
      await screen.findByRole('heading', {
        name: t('app.onboarding.title'),
      }),
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

    expect(
      await screen.findByRole('heading', { name: t('app.overview.title') }),
    ).toBeInTheDocument()
  })

  it('returns to the requested protected route after sign in', async () => {
    const user = userEvent.setup()

    renderAt('/app/onboarding')

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

    expect(
      await screen.findByRole('heading', {
        name: t('app.onboarding.title'),
      }),
    ).toBeInTheDocument()
  })

  it('shows translated validation feedback when sign-in input is invalid', async () => {
    const user = userEvent.setup()

    renderAt('/sign-in')

    await user.click(
      screen.getByRole('button', { name: t('common.actions.signIn') }),
    )

    expect(
      screen.getByText(t('auth.signIn.errors.invalidForm')),
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
})
