import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/t', () => ({ t: (key: string) => key }))

import { statusLabel } from '@/utils/household/status-label'

describe('household/status-label', () => {
  it('maps known statuses to translation keys', () => {
    expect(statusLabel('active')).toBe('groups.card.statusActive')
    expect(statusLabel('archived')).toBe('groups.card.statusArchived')
  })

  it('falls back to the raw status when unknown', () => {
    expect(statusLabel('paused')).toBe('paused')
  })
})
