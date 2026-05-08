import './profile-settings-page.test-setup'

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { ProfileSettingsPage } from '@/views/app/profile-settings-page'

import {
  fetchHouseholds,
  householdStoreState,
  resetProfileSettingsPageTestState,
} from './profile-settings-page.test-setup'

describe('ProfileSettingsPage memberships', () => {
  beforeEach(() => {
    resetProfileSettingsPageTestState()
  })

  it('renders locked settings hub layout and onboarding CTA when user has no households', () => {
    render(<ProfileSettingsPage />)

    expect(
      screen.getByText(t('app.settings.account.title')),
    ).toBeInTheDocument()

    expect(
      screen.getByText(t('app.settings.memberships.title')),
    ).toBeInTheDocument()

    expect(
      screen.getByText(t('app.settings.shortcuts.title')),
    ).toBeInTheDocument()

    expect(
      screen.getByText(t('app.settings.profile.title')),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: t('common.actions.openOnboarding'),
      }),
    ).toHaveAttribute('href', PATHS.ONBOARDING)

    expect(fetchHouseholds).toHaveBeenCalledTimes(1)
  })

  it('shows loading membership state without premature onboarding CTA', () => {
    householdStoreState.isLoading = true

    render(<ProfileSettingsPage />)

    expect(
      screen.getByText(t('app.settings.memberships.loading')),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: t('common.actions.openOnboarding'),
      }),
    ).not.toBeInTheDocument()
  })

  it('does not refetch households when memberships are already loaded', () => {
    householdStoreState.households = [
      {
        id: 'household-3',
        name: 'Loaded Household',
        role: 'member',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(fetchHouseholds).not.toHaveBeenCalled()
  })

  it('renders household error without onboarding CTA when list loading failed', () => {
    householdStoreState.error = 'Load households failed'

    render(<ProfileSettingsPage />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      t('app.settings.memberships.errors.loadFailed'),
    )

    expect(
      screen.getByRole('button', {
        name: t('app.settings.memberships.actions.retry'),
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', {
        name: t('common.actions.openOnboarding'),
      }),
    ).not.toBeInTheDocument()
  })

  it('refetches households on mount even when stale store error exists', () => {
    householdStoreState.error = 'Some older household error'

    render(<ProfileSettingsPage />)

    expect(fetchHouseholds).toHaveBeenCalledTimes(1)
  })

  it('retries household loading from memberships error state', () => {
    householdStoreState.error = 'Load households failed'

    render(<ProfileSettingsPage />)

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.settings.memberships.actions.retry'),
      }),
    )

    expect(fetchHouseholds).toHaveBeenCalledTimes(2)
  })
})
