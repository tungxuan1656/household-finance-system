import './onboarding-page.test-setup'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { OnboardingPage } from '@/views/app/onboarding-page'

import {
  createHouseholdMock,
  mockStoreState,
  replaceMock,
  resetOnboardingPageTestState,
} from './onboarding-page.test-setup'

describe('OnboardingPage progress states', () => {
  beforeEach(() => {
    resetOnboardingPageTestState()
  })

  it('redirects existing household members away from onboarding', async () => {
    mockStoreState.households = [{ id: 'hh-9' }]

    render(<OnboardingPage />)

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/households')
    })
  })

  it('shows completion actions after household creation succeeds', async () => {
    render(<OnboardingPage />)

    fireEvent.change(
      screen.getByLabelText('app.onboarding.fields.householdName.label'),
      {
        target: { value: 'Family Home' },
      },
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'app.onboarding.actions.create' }),
    )

    await waitFor(() => {
      expect(createHouseholdMock).toHaveBeenCalledWith({ name: 'Family Home' })
    })

    expect(
      screen.getByRole('button', { name: 'invite:hh-1' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: 'app.onboarding.actions.openBudgetSetup',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.openQuickAdd',
      }),
    ).toBeInTheDocument()
  })
})
