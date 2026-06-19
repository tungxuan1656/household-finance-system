import { describe, expect, it, vi } from 'vitest'

import type { CreateExpenseRequest } from '@/features/expenses/api'
import { confirmImport } from '@/features/expenses/import-confirm'
import type { ImportItemDraft } from '@/features/expenses/import-store'
import type { ExpenseDTO } from '@/features/home/types'

describe('confirmImport', () => {
  const pay = vi.fn((_payload: CreateExpenseRequest) =>
    Promise.resolve({
      id: `expense-${_payload.title}`,
      amountMinor: Math.round(_payload.amount * 1000),
      categoryKey: _payload.categoryKey,
      sourceKey: _payload.sourceKey,
      title: _payload.title,
      occurredAt: _payload.occurredAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      spentByUserId: 'user-1',
      currencyCode: 'VND',
      householdId: _payload.householdId ?? null,
      groupIds: _payload.groupIds ?? [],
      note: null,
    } satisfies ExpenseDTO),
  )

  const buildItem = (
    overrides: Partial<ImportItemDraft> & { id: string },
  ): ImportItemDraft => ({
    parsed: {
      amount: 10000,
      categoryKey: 'food',
      sourceKey: 'bank-transfer',
      title: 'Default item',
      occurredAt: '2026-06-19',
    },
    include: true,
    householdId: null,
    groupId: null,
    status: 'pending',
    ...overrides,
  })

  it('creates selected items sequentially in order', async () => {
    const payMock = vi.fn(pay)
    const items = [
      buildItem({
        id: 'item-1',
        parsed: {
          amount: 35000,
          categoryKey: 'food',
          sourceKey: 'bank-transfer',
          title: 'Ăn sáng',
          occurredAt: '2026-06-19',
        },
      }),
      buildItem({
        id: 'item-2',
        parsed: {
          amount: 50000,
          categoryKey: 'transport',
          sourceKey: 'cash',
          title: 'Đi xe ôm',
          occurredAt: '2026-06-19',
        },
      }),
      buildItem({
        id: 'item-3',
        parsed: {
          amount: 20000,
          categoryKey: 'food',
          sourceKey: 'bank-transfer',
          title: 'Cà phê',
          occurredAt: '2026-06-19',
        },
      }),
    ]

    const result = await confirmImport(items, payMock)

    expect(payMock).toHaveBeenCalledTimes(3)

    // First call
    expect(payMock.mock.calls[0]![0]).toMatchObject({
      amount: 35000,
      categoryKey: 'food',
      title: 'Ăn sáng',
    })

    // Second call
    expect(payMock.mock.calls[1]![0]).toMatchObject({
      amount: 50000,
      categoryKey: 'transport',
      title: 'Đi xe ôm',
    })

    // Third call
    expect(payMock.mock.calls[2]![0]).toMatchObject({
      amount: 20000,
      categoryKey: 'food',
      title: 'Cà phê',
    })

    expect(result.succeeded).toEqual(['item-1', 'item-2', 'item-3'])
    expect(result.failed).toEqual([])
  })

  it('maps parsed.occurredAt string to numeric timestamp on CreateExpenseRequest', async () => {
    const payMock = vi.fn(pay)
    const items = [
      buildItem({
        id: 'item-date',
        parsed: {
          amount: 35000,
          categoryKey: 'food',
          sourceKey: 'bank-transfer',
          title: 'Ăn sáng',
          occurredAt: '2026-06-19',
        },
      }),
    ]

    await confirmImport(items, payMock)

    const request: CreateExpenseRequest = payMock.mock.calls[0]![0]
    // 2026-06-19T00:00:00.000Z in epoch ms
    expect(request.occurredAt).toBe(new Date('2026-06-19T00:00:00').getTime())
  })

  it('maps context householdId and groupId to the create request', async () => {
    const payMock = vi.fn(pay)
    const items = [
      buildItem({
        id: 'item-ctx',
        householdId: 'household-1',
        groupId: 'group-da-lat',
      }),
    ]

    await confirmImport(items, payMock)

    const request: CreateExpenseRequest = payMock.mock.calls[0]![0]
    expect(request.householdId).toBe('household-1')
    expect(request.groupIds).toEqual(['group-da-lat'])
  })

  it('skips items where include is false', async () => {
    const payMock = vi.fn(pay)
    const items = [
      buildItem({ id: 'item-a', include: true }),
      buildItem({ id: 'item-b', include: false }),
      buildItem({ id: 'item-c', include: true }),
    ]

    const result = await confirmImport(items, payMock)

    expect(payMock).toHaveBeenCalledTimes(2)
    expect(result.succeeded).toEqual(['item-a', 'item-c'])
  })

  it('does not retry successful items when a later item fails', async () => {
    const payMock = vi
      .fn()
      .mockResolvedValueOnce({
        id: 'expense-1',
        title: 'First OK',
      } as ExpenseDTO)
      .mockRejectedValueOnce(new Error('Server error'))
      .mockResolvedValueOnce({
        id: 'expense-3',
        title: 'Third OK',
      } as ExpenseDTO)

    const items = [
      buildItem({
        id: 'item-1',
        parsed: {
          amount: 10000,
          categoryKey: 'food',
          sourceKey: 'cash',
          title: 'First OK',
          occurredAt: '2026-06-19',
        },
      }),
      buildItem({
        id: 'item-2',
        parsed: {
          amount: 20000,
          categoryKey: 'transport',
          sourceKey: 'cash',
          title: 'Second FAIL',
          occurredAt: '2026-06-19',
        },
      }),
      buildItem({
        id: 'item-3',
        parsed: {
          amount: 30000,
          categoryKey: 'food',
          sourceKey: 'cash',
          title: 'Third OK',
          occurredAt: '2026-06-19',
        },
      }),
    ]

    const result = await confirmImport(items, payMock)

    // All 3 items attempted exactly once each
    expect(payMock).toHaveBeenCalledTimes(3)

    // item-1 succeeded, item-2 failed, item-3 succeeded
    expect(result.succeeded).toEqual(['item-1', 'item-3'])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0]!.id).toBe('item-2')
    expect(result.failed[0]!.error).toBeDefined()
  })

  it('returns partial failure when some items fail', async () => {
    const payMock = vi
      .fn()
      .mockResolvedValueOnce({ id: 'expense-1' } as ExpenseDTO)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Validation error'))

    const items = [
      buildItem({ id: 'item-ok' }),
      buildItem({ id: 'item-fail-1' }),
      buildItem({ id: 'item-fail-2' }),
    ]

    const result = await confirmImport(items, payMock)

    expect(result.succeeded).toEqual(['item-ok'])
    expect(result.failed).toHaveLength(2)
    expect(result.failed[0]!.id).toBe('item-fail-1')
    expect(result.failed[1]!.id).toBe('item-fail-2')
  })

  it('skips items already marked as success', async () => {
    const payMock = vi.fn(pay)
    const items = [
      buildItem({ id: 'item-a', status: 'success' }),
      buildItem({ id: 'item-b', include: true }),
    ]

    const result = await confirmImport(items, payMock)

    expect(payMock).toHaveBeenCalledTimes(1)
    expect(result.succeeded).toEqual(['item-b'])
    expect(result.failed).toEqual([])
  })
})
