import { describe, expect, it } from 'vitest'

import { postCreateKeyboard, recentsKeyboard } from '@/bot/renderers/keyboards'

describe('postCreateKeyboard (feat-135 native single-message grouped summary)', () => {
  it('renders the delete button (single stacked row, no household)', () => {
    const kb = postCreateKeyboard('exp-1')
    const labels = kb.inline_keyboard.flat().map((b) => b.text)

    expect(labels).toContain('🗑 Xoá')
    expect(labels).not.toContain('🏠 Chọn gia đình')
    expect(kb.inline_keyboard).toHaveLength(1)
    expect(kb.inline_keyboard[0]).toHaveLength(1)
  })

  it('does not contain household callback', () => {
    const kb = postCreateKeyboard('exp-1')
    const callbacks = kb.inline_keyboard.flat().map((b) => b.callback_data)

    expect(callbacks).not.toContain('ch_household:exp-1')
  })

  it('renders delete button with ch_delete callback', () => {
    const kb = postCreateKeyboard('exp-99')
    const callbacks = kb.inline_keyboard.flat().map((b) => b.callback_data)

    expect(callbacks).toContain('ch_delete:exp-99')
  })

  it('wires the delete button to the ch_delete callback', () => {
    const kb = postCreateKeyboard('exp-99')
    const callbacks = kb.inline_keyboard.flat().map((b) => b.callback_data)

    expect(callbacks).toContain('ch_delete:exp-99')
    expect(callbacks).not.toContain('ch_household:exp-99')
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
