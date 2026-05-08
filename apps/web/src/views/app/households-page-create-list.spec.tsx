import './households-page.test-setup'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { t } from '@/lib/i18n/t'
import { householdActions } from '@/stores/household.store'
import { HouseholdsPage } from '@/views/app/households-page'

import {
  householdStoreState,
  resetHouseholdsPageTestState,
} from './households-page.test-setup'

describe('HouseholdsPage create flow with existing list', () => {
  beforeEach(() => {
    resetHouseholdsPageTestState()
    vi.mocked(householdActions.createHousehold).mockReset()

    vi.mocked(householdActions.createHousehold).mockImplementation(
      async () => ({
        createdAt: 1,
        defaultCurrencyCode: 'VND',
        defaultVisibility: 'private',
        id: 'household-created',
        name: 'Gia đình mới',
        role: 'admin',
        slug: 'gia-dinh-moi',
        timezone: 'Asia/Ho_Chi_Minh',
      }),
    )
  })

  it('keeps existing household list visible while creating a household', async () => {
    householdStoreState.households = [
      {
        createdAt: 1,
        defaultCurrencyCode: 'VND',
        defaultVisibility: 'private',
        id: 'household-1',
        name: 'Gia đình Một',
        role: 'admin',
        slug: 'gia-dinh-mot',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    ]

    let resolveCreateHousehold: (() => void) | undefined
    const createHouseholdMock = vi
      .mocked(householdActions.createHousehold)
      .mockImplementation(async () => {
        householdStoreState.isLoading = true
        rerender(<HouseholdsPage />)

        return await new Promise((resolve) => {
          resolveCreateHousehold = () => {
            householdStoreState.isLoading = false
            rerender(<HouseholdsPage />)

            resolve({
              createdAt: 3,
              defaultCurrencyCode: 'VND',
              defaultVisibility: 'private',
              id: 'household-3',
              name: 'Nhà mới',
              role: 'admin',
              slug: 'nha-moi',
              timezone: 'Asia/Ho_Chi_Minh',
            })
          }
        })
      })

    const { container, rerender } = render(<HouseholdsPage />)

    fireEvent.click(
      screen.getByRole('button', { name: t('app.households.actions.create') }),
    )

    fireEvent.change(
      screen.getByLabelText(t('app.households.fields.householdName.label')),
      {
        target: { value: 'Nhà mới' },
      },
    )

    fireEvent.click(
      screen.getByRole('button', { name: t('app.households.actions.create') }),
    )

    await waitFor(() => {
      expect(createHouseholdMock).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByText('Gia đình Một')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(0)

    expect(
      screen.getByRole('dialog', { name: t('app.households.create.title') }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: t('app.households.actions.creating'),
      }),
    ).toBeDisabled()

    await act(async () => {
      resolveCreateHousehold?.()
    })
  })

  it('keeps existing household list visible when create fails with a shared store error', async () => {
    householdStoreState.households = [
      {
        createdAt: 1,
        defaultCurrencyCode: 'VND',
        defaultVisibility: 'private',
        id: 'household-1',
        name: 'Gia đình Một',
        role: 'admin',
        slug: 'gia-dinh-mot',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    ]

    const createHouseholdMock = vi
      .mocked(householdActions.createHousehold)
      .mockImplementation(async () => {
        householdStoreState.error = 'Create household failed'
        throw new Error('Create household failed')
      })

    render(<HouseholdsPage />)

    fireEvent.click(
      screen.getByRole('button', { name: t('app.households.actions.create') }),
    )

    fireEvent.change(
      screen.getByLabelText(t('app.households.fields.householdName.label')),
      {
        target: { value: 'Nhà mới' },
      },
    )

    fireEvent.click(
      screen.getByRole('button', { name: t('app.households.actions.create') }),
    )

    await waitFor(() => {
      expect(createHouseholdMock).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByText('Gia đình Một')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
