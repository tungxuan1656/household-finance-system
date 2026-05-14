import { describe, expect, it } from 'vitest'

import { isEditableTarget } from '@/utils/dom/is-editable-target'

describe('dom/is-editable-target', () => {
  it('returns false for null targets', () => {
    expect(isEditableTarget(null)).toBe(false)
  })

  it('returns true for input elements', () => {
    const input = document.createElement('input')

    expect(isEditableTarget(input)).toBe(true)
  })

  it('returns true for contenteditable elements', () => {
    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')

    expect(isEditableTarget(div)).toBe(true)
  })

  it('returns false for non-editable elements', () => {
    const span = document.createElement('span')

    expect(isEditableTarget(span)).toBe(false)
  })
})
