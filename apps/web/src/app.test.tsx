import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AppRoutes } from '@/router'

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

describe('web shell routing', () => {
  it('redirects the root route to sign in', async () => {
    renderAt('/')

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Create an account' }),
    ).toBeInTheDocument()
  })

  it('renders the sign-up page at the public route', () => {
    renderAt('/sign-up')

    expect(
      screen.getByRole('heading', { name: 'Create your account' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
  })

  it('renders the protected shell and onboarding placeholder', async () => {
    const user = userEvent.setup()

    renderAt('/app')

    expect(
      screen.getByRole('heading', { name: 'Household workspace' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Onboarding' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Finish setting up your household',
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
})
