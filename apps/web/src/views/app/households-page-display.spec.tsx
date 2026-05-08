import './households-page.test-setup'

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { t } from '@/lib/i18n/t'
import { HouseholdsPage } from '@/views/app/households-page'

import {
  fetchHouseholdsMock,
  householdStoreState,
  resetHouseholdsPageTestState,
} from './households-page.test-setup'

describe('HouseholdsPage display', () => {
  beforeEach(() => {
    resetHouseholdsPageTestState()
  })

  it('renders localized household cards without placeholder member count', () => {
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
      {
        createdAt: 2,
        defaultCurrencyCode: 'USD',
        defaultVisibility: 'household',
        id: 'household-2',
        name: 'Gia đình Hai',
        role: 'member',
        slug: 'gia-dinh-hai',
        timezone: 'UTC',
      },
    ]

    render(<HouseholdsPage />)

    expect(fetchHouseholdsMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Gia đình Một')).toBeInTheDocument()
    expect(screen.getByText('Gia đình Hai')).toBeInTheDocument()

    const firstCard = screen
      .getByText('Gia đình Một')
      .closest('[data-slot="card"]')
    const secondCard = screen
      .getByText('Gia đình Hai')
      .closest('[data-slot="card"]')

    expect(firstCard).not.toBeNull()
    expect(secondCard).not.toBeNull()
    expect(screen.getByText('Quản trị viên')).toBeInTheDocument()
    expect(screen.getByText('Thành viên')).toBeInTheDocument()
    expect(firstCard).toHaveTextContent('VND')
    expect(firstCard).toHaveTextContent('Asia/Ho_Chi_Minh')
    expect(firstCard).toHaveTextContent('2 thành viên')
    expect(secondCard).toHaveTextContent('USD')
    expect(secondCard).toHaveTextContent('UTC')
    expect(secondCard).toHaveTextContent('1 thành viên')
    expect(screen.getByText('Riêng tư')).toBeInTheDocument()
    expect(screen.getByText('Chia sẻ trong gia đình')).toBeInTheDocument()
    expect(screen.getByText('Ngân sách · Đang hoạt động')).toBeInTheDocument()

    expect(
      screen.getByText('Ngân sách · Chưa đặt ngân sách'),
    ).toBeInTheDocument()

    expect(firstCard).toHaveTextContent('Đã chi')
    expect(firstCard).toHaveTextContent('6 khoản chi')
    expect(secondCard).toHaveTextContent('Đã chi')
    expect(secondCard).toHaveTextContent('0 khoản chi')

    expect(
      screen.queryByText(t('app.households.memberCountPlaceholder')),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByText(t('app.households.create.description')),
    ).not.toBeInTheDocument()

    expect(
      screen.getAllByRole('link', {
        name: t('app.households.actions.viewDetail'),
      }),
    ).toHaveLength(2)
  })

  it('renders an accessible retry state when loading households fails', async () => {
    fetchHouseholdsMock.mockImplementationOnce(async () => {
      throw new Error('Load households failed')
    })

    render(<HouseholdsPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Load households failed',
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: t('app.households.actions.retry'),
      }),
    )

    expect(fetchHouseholdsMock).toHaveBeenCalledTimes(2)
  })

  it('renders loading placeholders instead of a text-only loading card', () => {
    householdStoreState.isLoading = true

    const { container } = render(<HouseholdsPage />)

    expect(
      screen.queryByText(t('app.households.loading')),
    ).not.toBeInTheDocument()

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0)
  })
})
