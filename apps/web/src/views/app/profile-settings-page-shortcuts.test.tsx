import './profile-settings-page.test-setup'

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { ProfileSettingsPage } from '@/views/app/profile-settings-page'

import {
  householdStoreState,
  resetProfileSettingsPageTestState,
} from './profile-settings-page.test-setup'

describe('ProfileSettingsPage shortcuts', () => {
  beforeEach(() => {
    resetProfileSettingsPageTestState()
  })

  it('shows member-safe shortcuts for household member', () => {
    householdStoreState.households = [
      {
        id: 'household-1',
        name: 'Family One',
        role: 'member',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(screen.getByRole('link', { name: 'Family One' })).toHaveAttribute(
      'href',
      `${PATHS.HOUSEHOLDS}/household-1`,
    )

    expect(
      screen.getByRole('link', {
        name: t('app.settings.shortcuts.actions.viewHousehold'),
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-1`)

    expect(screen.queryByText('Quản lý thành viên')).not.toBeInTheDocument()
    expect(screen.queryByText('Mở cài đặt gia đình')).not.toBeInTheDocument()
    expect(screen.queryByText('Mời thành viên')).not.toBeInTheDocument()

    expect(
      screen.getByText(
        t('app.householdDetail.members.invite.fields.role.options.member'),
      ),
    ).toBeInTheDocument()
  })

  it('shows admin-only shortcuts for admin household membership', () => {
    householdStoreState.households = [
      {
        id: 'household-2',
        name: 'Admin Family',
        role: 'admin',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(screen.getByRole('link', { name: 'Admin Family' })).toHaveAttribute(
      'href',
      `${PATHS.HOUSEHOLDS}/household-2`,
    )

    expect(
      screen.getByRole('link', {
        name: t('app.settings.shortcuts.actions.viewHousehold'),
      }),
    ).toHaveAttribute('href', `${PATHS.HOUSEHOLDS}/household-2`)

    expect(screen.queryByText('Quản lý thành viên')).not.toBeInTheDocument()
    expect(screen.queryByText('Mở cài đặt gia đình')).not.toBeInTheDocument()
    expect(screen.queryByText('Mời thành viên')).not.toBeInTheDocument()

    expect(
      screen.getByText(
        t('app.householdDetail.members.invite.fields.role.options.admin'),
      ),
    ).toBeInTheDocument()
  })

  it('renders every current household membership', () => {
    householdStoreState.households = [
      {
        id: 'household-4',
        name: 'Family One',
        role: 'member',
      },
      {
        id: 'household-5',
        name: 'Family Two',
        role: 'admin',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(screen.getByRole('link', { name: 'Family One' })).toHaveAttribute(
      'href',
      `${PATHS.HOUSEHOLDS}/household-4`,
    )

    expect(screen.getByRole('link', { name: 'Family Two' })).toHaveAttribute(
      'href',
      `${PATHS.HOUSEHOLDS}/household-5`,
    )

    expect(screen.getAllByText('Family One')).toHaveLength(2)
    expect(screen.getAllByText('Family Two')).toHaveLength(2)
  })

  it('labels each shortcut group with household name and only shows truthful actions', () => {
    householdStoreState.households = [
      {
        id: 'household-4',
        name: 'Family One',
        role: 'member',
      },
      {
        id: 'household-5',
        name: 'Family Two',
        role: 'admin',
      },
    ]

    render(<ProfileSettingsPage />)

    expect(
      screen.getAllByRole('link', {
        name: t('app.settings.shortcuts.actions.viewHousehold'),
      }),
    ).toHaveLength(2)

    expect(screen.getAllByText('Family One')).toHaveLength(2)
    expect(screen.getAllByText('Family Two')).toHaveLength(2)
    expect(screen.queryByText('Quản lý thành viên')).not.toBeInTheDocument()
    expect(screen.queryByText('Mở cài đặt gia đình')).not.toBeInTheDocument()
    expect(screen.queryByText('Mời thành viên')).not.toBeInTheDocument()
  })
})
