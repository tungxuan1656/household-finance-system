import { describe, expect, it } from 'vitest'

import * as keyboards from '@/bot/renderers/keyboards'
import { postCreateKeyboard, recentsKeyboard } from '@/bot/renderers/keyboards'

describe('postCreateKeyboard (feat-135 follow-up pure text - no keyboard)', () => {
  it('returns undefined or empty keyboard (pure text, no buttons)', () => {
    const kb = postCreateKeyboard('exp-1') as unknown as
      | { inline_keyboard: unknown[] }
      | undefined

    if (kb === undefined) {
      expect(kb).toBeUndefined()
    } else {
      expect(kb.inline_keyboard).toBeDefined()
      expect(kb.inline_keyboard).toHaveLength(0)
    }

    const serialized = JSON.stringify(kb ?? '')
    expect(serialized).not.toContain('ch_delete')
    expect(serialized).not.toContain('ch_household')
    expect(serialized).not.toContain('🗑')
  })

  it('does not expose ch_delete export', () => {
    const maybe = (keyboards as unknown as Record<string, unknown>)
      .postCreateKeyboard
    if (maybe === undefined) {
      expect(maybe).toBeUndefined()
      return
    }

    expect(typeof maybe).toBe('function')
    const kb = (maybe as (id: string) => unknown)('exp-99') as unknown as string
    const serialized = JSON.stringify(kb ?? '')
    expect(serialized).not.toContain('ch_delete')
  })

  it('is pure text: no inline_keyboard with delete or household buttons', () => {
    const kb = postCreateKeyboard('exp-99') as unknown as
      | {
          inline_keyboard: Array<
            Array<{ text: string; callback_data?: string }>
          >
        }
      | undefined

    if (kb === undefined) {
      expect(kb).toBeUndefined()
      return
    }

    const labels = kb.inline_keyboard.flat().map((b) => b.text)
    expect(labels).not.toContain('🗑 Xoá')
    expect(labels).not.toContain('🏠 Chọn gia đình')

    const callbacks = kb.inline_keyboard
      .flat()
      .map((b) => b.callback_data)
      .filter(Boolean)
    expect(callbacks.join(' ')).not.toContain('ch_delete')
    expect(callbacks.join(' ')).not.toContain('ch_household')
  })
})

describe('recentsKeyboard', () => {
  it('deep-links to the expenses route in the Mini App', () => {
    const kb = recentsKeyboard('https://phofis-tma.pages.dev/')

    expect(kb.inline_keyboard[0]?.[0]?.text).toBe('📋 Xem tất cả')
    expect(kb.inline_keyboard[0]?.[0]?.web_app?.url).toBe(
      'https://phofis-tma.pages.dev/expenses',
    )
  })

  it('deep-links correctly when the base URL has no trailing slash', () => {
    const kb = recentsKeyboard('https://phofis-tma.pages.dev')

    expect(kb.inline_keyboard[0]?.[0]?.web_app?.url).toBe(
      'https://phofis-tma.pages.dev/expenses',
    )
  })
})
