import { describe, expect, it } from 'vitest'

import {
  expensePreviewKeyboard,
  householdSelectKeyboard,
  postCreateKeyboard,
} from '@/bot/renderers/keyboards'

describe('expensePreviewKeyboard', () => {
  it('shows confirm, household, and cancel buttons (no retry)', () => {
    const kb = expensePreviewKeyboard('draft-1')

    const labels = kb.inline_keyboard.flat().map((b) => b.text)

    expect(labels).toContain('✅ Thêm chi tiêu')
    expect(labels).toContain('🏠 Chọn gia đình')
    expect(labels).toContain('❌ Hủy')
    // Retry was removed; users can simply send a new expense message.
    expect(labels).not.toContain('🔁 Nhập lại')
  })

  it('wires the buttons to the right callbacks', () => {
    const kb = expensePreviewKeyboard('draft-1')

    const callbacks = kb.inline_keyboard.flat().map((b) => b.callback_data)

    expect(callbacks).toContain('confirm:draft-1')
    expect(callbacks).toContain('household:draft-1')
    expect(callbacks).toContain('cancel:draft-1')
  })
})

describe('householdSelectKeyboard', () => {
  it('lists personal and one button per household', () => {
    const kb = householdSelectKeyboard('draft-1', [
      { id: 'hh-1', name: 'Gia đình A' },
      { id: 'hh-2', name: 'Gia đình B' },
    ])

    const rows = kb.inline_keyboard

    expect(rows).toHaveLength(3)
    expect(rows[0]?.[0]?.text).toBe('👤 Cá nhân')
    expect(rows[1]?.[0]?.text).toBe('🏠 Gia đình A')
    expect(rows[2]?.[0]?.text).toBe('🏠 Gia đình B')
  })
})

describe('postCreateKeyboard (feat-121 natural-input direct-create)', () => {
  it('shows the household button when the caller asks for it', () => {
    const kb = postCreateKeyboard('exp-1', true)
    const labels = kb.inline_keyboard.flat().map((b) => b.text)

    expect(labels).toContain('🏠 Chọn gia đình')
  })

  it('hides the household button when the caller asks to hide it', () => {
    const kb = postCreateKeyboard('exp-1', false)
    const labels = kb.inline_keyboard.flat().map((b) => b.text)

    expect(labels).not.toContain('🏠 Chọn gia đình')
    expect(kb.inline_keyboard).toHaveLength(0)
  })

  it('does not render the delete button (removed)', () => {
    const kbWithHousehold = postCreateKeyboard('exp-1', true)
    const kbWithoutHousehold = postCreateKeyboard('exp-1', false)

    const allLabels = [
      ...kbWithHousehold.inline_keyboard.flat(),
      ...kbWithoutHousehold.inline_keyboard.flat(),
    ].map((b) => b.text)

    expect(allLabels).not.toContain('🗑 Xoá')
  })

  it('wires the household button to the ch_household callback', () => {
    const kb = postCreateKeyboard('exp-99', true)
    const callbacks = kb.inline_keyboard.flat().map((b) => b.callback_data)

    expect(callbacks).toContain('ch_household:exp-99')
    expect(callbacks).not.toContain('ch_delete:exp-99')
  })
})
