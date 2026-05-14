import { describe, expect, it, vi } from 'vitest'

import type { AnalyticsExportParams } from '@/types/analytics'
import { downloadBlob, getFallbackFilename } from '@/utils/export/download'

describe('export/download', () => {
  it('builds fallback filenames for household and personal exports', () => {
    const withHousehold: AnalyticsExportParams = {
      period: '2026-05',
      household_id: 'household-1',
    }

    const personal: AnalyticsExportParams = {
      period: '2026-05',
    }

    expect(getFallbackFilename(withHousehold)).toBe(
      'analytics-2026-05-household.csv',
    )

    expect(getFallbackFilename(personal)).toBe('analytics-2026-05-personal.csv')
  })

  it('creates a download link and revokes the object URL', () => {
    if (!URL.createObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', {
        value: () => 'blob:mock-url',
        writable: true,
      })
    }

    if (!URL.revokeObjectURL) {
      Object.defineProperty(URL, 'revokeObjectURL', {
        value: () => undefined,
        writable: true,
      })
    }

    const createUrlMock = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url')
    const revokeUrlMock = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined)
    const clickMock = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    vi.useFakeTimers()

    downloadBlob(new Blob(['data']), 'export.csv')

    expect(createUrlMock).toHaveBeenCalledTimes(1)
    expect(clickMock).toHaveBeenCalledTimes(1)

    vi.runAllTimers()

    expect(revokeUrlMock).toHaveBeenCalledWith('blob:mock-url')

    vi.useRealTimers()
    createUrlMock.mockRestore()
    revokeUrlMock.mockRestore()
    clickMock.mockRestore()
  })
})
