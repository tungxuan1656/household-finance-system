import { afterEach, describe, expect, it, vi } from 'vitest'

import { removeLocalStorageItem } from '@/lib/storages/browser-storage'

import { changeLanguage } from './index'

afterEach(() => {
  vi.restoreAllMocks()
  removeLocalStorageItem('appLanguage')
})

describe('changeLanguage', () => {
  it('does not throw when localStorage writes are blocked', () => {
    const storageSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage blocked')
      })

    expect(() => changeLanguage('vi-VN')).not.toThrow()

    expect(storageSpy).toHaveBeenCalledWith('appLanguage', 'vi')
  })
})
