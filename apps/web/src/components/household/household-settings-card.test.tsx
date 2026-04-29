import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HouseholdSettingsCard } from '@/components/household/household-settings-card'
import { t } from '@/lib/i18n/t'
import type { HouseholdDTO } from '@/types/household'

const baseHousehold: HouseholdDTO = {
  createdAt: Date.now(),
  defaultCurrencyCode: 'VND',
  defaultVisibility: 'household',
  id: 'h-settings',
  name: 'Family Settings',
  role: 'admin',
  slug: 'family-settings',
  timezone: 'Asia/Ho_Chi_Minh',
}

describe('HouseholdSettingsCard', () => {
  it('renders read-only mode for non-admin members', () => {
    render(
      <HouseholdSettingsCard
        household={{
          ...baseHousehold,
          role: 'member',
        }}
        isAdmin={false}
        isSubmitting={false}
        memberCount={2}
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.getByText(t('app.householdDetail.memberReadOnly')),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: t('app.householdDetail.actions.save'),
      }),
    ).not.toBeInTheDocument()
  })

  it('renders editable mode for admins', () => {
    render(
      <HouseholdSettingsCard
        household={baseHousehold}
        isAdmin={true}
        isSubmitting={false}
        memberCount={2}
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: t('app.householdDetail.actions.save'),
      }),
    ).toBeInTheDocument()
  })
})
