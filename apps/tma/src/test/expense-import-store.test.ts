import { beforeEach, describe, expect, it } from 'vitest'

import type { ParsedExpenseItem } from '@/features/expenses/import-api'
import { useImportFlowStore } from '@/features/expenses/import-store'

describe('useImportFlowStore', () => {
  beforeEach(() => {
    useImportFlowStore.getState().reset()
  })

  const sampleParsed: ParsedExpenseItem[] = [
    {
      amount: 35000,
      categoryKey: 'food',
      sourceKey: 'bank-transfer',
      title: 'Ăn sáng',
      occurredAt: '2026-06-19',
    },
    {
      amount: 50000,
      categoryKey: 'transport',
      sourceKey: 'cash',
      title: 'Đi xe ôm',
      occurredAt: '2026-06-19',
    },
  ]

  it('starts with empty raw text and no items', () => {
    const state = useImportFlowStore.getState()

    expect(state.rawText).toBe('')
    expect(state.items).toEqual([])
  })

  it('stores raw text from user input', () => {
    useImportFlowStore.getState().setRawText('ăn sáng 35k, đi xe ôm 50k')

    expect(useImportFlowStore.getState().rawText).toBe(
      'ăn sáng 35k, đi xe ôm 50k',
    )
  })

  it('stores parsed items with include=true and status=pending by default', () => {
    useImportFlowStore.getState().setItems(sampleParsed)

    const items = useImportFlowStore.getState().items

    expect(items).toHaveLength(2)
    expect(items[0]!.include).toBe(true)
    expect(items[0]!.status).toBe('pending')
    expect(items[0]!.parsed).toEqual(sampleParsed[0])
    expect(items[0]!.householdId).toBeNull()
    expect(items[0]!.groupId).toBeNull()

    expect(items[1]!.include).toBe(true)
    expect(items[1]!.status).toBe('pending')
    expect(items[1]!.parsed).toEqual(sampleParsed[1])
  })

  it('assigns a unique id to each item', () => {
    useImportFlowStore.getState().setItems(sampleParsed)

    const items = useImportFlowStore.getState().items

    expect(items[0]!.id).toBeDefined()
    expect(typeof items[0]!.id).toBe('string')
    expect(items[0]!.id).not.toBe(items[1]!.id)
  })

  it('toggles include on a specific item', () => {
    useImportFlowStore.getState().setItems(sampleParsed)

    const firstId = useImportFlowStore.getState().items[0]!.id

    useImportFlowStore.getState().toggleInclude(firstId)

    expect(
      useImportFlowStore.getState().items.find((i) => i.id === firstId)!
        .include,
    ).toBe(false)

    useImportFlowStore.getState().toggleInclude(firstId)

    expect(
      useImportFlowStore.getState().items.find((i) => i.id === firstId)!
        .include,
    ).toBe(true)
  })

  it('sets per-item household context', () => {
    useImportFlowStore.getState().setItems(sampleParsed)

    const firstId = useImportFlowStore.getState().items[0]!.id

    useImportFlowStore
      .getState()
      .setItemContext(firstId, { householdId: 'household-1' })

    const updated = useImportFlowStore
      .getState()
      .items.find((i) => i.id === firstId)!
    expect(updated.householdId).toBe('household-1')
    expect(updated.groupId).toBeNull()
  })

  it('sets per-item group context', () => {
    useImportFlowStore.getState().setItems(sampleParsed)

    const firstId = useImportFlowStore.getState().items[0]!.id

    useImportFlowStore
      .getState()
      .setItemContext(firstId, { groupId: 'group-da-lat' })

    const updated = useImportFlowStore
      .getState()
      .items.find((i) => i.id === firstId)!
    expect(updated.groupId).toBe('group-da-lat')
    expect(updated.householdId).toBeNull()
  })

  it('sets per-item household and group context together', () => {
    useImportFlowStore.getState().setItems(sampleParsed)

    const firstId = useImportFlowStore.getState().items[0]!.id

    useImportFlowStore.getState().setItemContext(firstId, {
      householdId: 'household-1',
      groupId: 'group-da-lat',
    })

    const updated = useImportFlowStore
      .getState()
      .items.find((i) => i.id === firstId)!
    expect(updated.householdId).toBe('household-1')
    expect(updated.groupId).toBe('group-da-lat')
  })

  it('sets per-item status and optional error message', () => {
    useImportFlowStore.getState().setItems(sampleParsed)

    const items = useImportFlowStore.getState().items
    const firstId = items[0]!.id
    const secondId = items[1]!.id

    useImportFlowStore.getState().setItemStatus(firstId, 'success')

    useImportFlowStore
      .getState()
      .setItemStatus(secondId, 'error', 'Server rejected')

    const after = useImportFlowStore.getState().items
    expect(after.find((i) => i.id === firstId)!.status).toBe('success')
    expect(after.find((i) => i.id === secondId)!.status).toBe('error')
    expect(after.find((i) => i.id === secondId)!.error).toBe('Server rejected')
  })

  it('context does not affect other items', () => {
    useImportFlowStore.getState().setItems(sampleParsed)

    const [firstId, secondId] = useImportFlowStore
      .getState()
      .items.map((i) => i.id)

    useImportFlowStore
      .getState()
      .setItemContext(firstId!, { householdId: 'household-1' })

    const items = useImportFlowStore.getState().items
    expect(items.find((i) => i.id === secondId)!.householdId).toBeNull()
  })

  it('reset clears rawText and items', () => {
    useImportFlowStore.getState().setRawText('ăn sáng 35k')
    useImportFlowStore.getState().setItems(sampleParsed)

    useImportFlowStore.getState().reset()

    const state = useImportFlowStore.getState()
    expect(state.rawText).toBe('')
    expect(state.items).toEqual([])
  })

  it('back behavior: reset allows re-entry without stale parsed data', () => {
    // Simulate: user enters text -> parses -> sees preview -> goes back
    useImportFlowStore.getState().setRawText('ăn sáng 35k')
    useImportFlowStore.getState().setItems(sampleParsed)

    useImportFlowStore
      .getState()
      .toggleInclude(useImportFlowStore.getState().items[0]!.id)

    // User taps back — reset
    useImportFlowStore.getState().reset()

    // After reset, user should be able to start fresh
    expect(useImportFlowStore.getState().rawText).toBe('')
    expect(useImportFlowStore.getState().items).toEqual([])

    // Re-entering text and parsing works on clean state
    useImportFlowStore.getState().setRawText('cà phê 20k')
    expect(useImportFlowStore.getState().rawText).toBe('cà phê 20k')
  })
})
