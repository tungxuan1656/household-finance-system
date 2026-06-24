import { describe, expect, it } from 'vitest'

import {
  expensePreviewKeyboard,
  householdSelectKeyboard,
} from '@/bot/renderers/keyboards'

describe('expensePreviewKeyboard', () => {
  it('shows confirm, household, and cancel buttons (no retry)', () => {
    const kb = expensePreviewKeyboard('draft-1')

    const labels = kb.inline_keyboard.flat().map((b) => b.text)

    expect(labels).toContain('✅ Thêm chi tiêu')
    expect(labels).toContain('🏠 Chọn household')
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
