import { describe, expect, it } from 'vitest'

import { createExpenseRequestSchema } from '@/contracts'

describe('expense contract schema', () => {
  describe('valid payloads', () => {
    it('accepts minimal valid personal expense', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.householdId).toBeUndefined()
      }
    })

    it('accepts full valid household expense with optional fields', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 150000,
        categoryKey: 'transport',
        sourceKey: 'card',
        title: 'Monthly commute pass',
        occurredAt: 1750000000000,
        note: 'Includes bus and metro',
        householdId: 'hh_abc123',
        groupIds: ['group-1'],
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.householdId).toBe('hh_abc123')
        expect(parsed.data.groupIds).toEqual(['group-1'])
        expect(parsed.data.note).toBe('Includes bus and metro')
      }
    })

    it('accepts expense with note at max length (1000 chars)', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 1000,
        categoryKey: 'shopping',
        sourceKey: 'momo',
        title: 'Item',
        occurredAt: 1750000000000,
        note: 'a'.repeat(1000),
      })

      expect(parsed.success).toBe(true)
    })

    it('accepts expense with title at max length (200 chars)', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 100,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'a'.repeat(200),
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(true)
    })
  })

  describe('amount validation', () => {
    it('rejects zero amount', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 0,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects negative amount', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: -5000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(false)
    })
  })

  describe('categoryKey validation', () => {
    it('rejects money-in category (income kind)', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 1000000,
        categoryKey: 'money-in',
        sourceKey: 'bank-transfer',
        title: 'Salary',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects lending category (transfer kind)', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 500000,
        categoryKey: 'lending',
        sourceKey: 'cash',
        title: 'Loan to friend',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(false)
    })

    it('accepts valid expense category (food)', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Breakfast',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(true)
    })
  })

  describe('title validation', () => {
    it('rejects blank title', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: '',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects whitespace-only title', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: '   ',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects title exceeding 200 characters', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'a'.repeat(201),
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(false)
    })
  })

  describe('occurredAt validation', () => {
    it('rejects negative timestamp', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: -1,
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects non-integer timestamp', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: 1750000000000.5,
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects zero timestamp', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: 0,
      })

      expect(parsed.success).toBe(false)
    })
  })

  describe('household context', () => {
    it('accepts householdId when provided', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Family dinner',
        occurredAt: 1750000000000,
        householdId: 'hh_valid123',
      })

      expect(parsed.success).toBe(true)
    })

    it('rejects blank householdId', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Family dinner',
        occurredAt: 1750000000000,
        householdId: '   ',
      })

      expect(parsed.success).toBe(false)
    })
  })

  describe('note length validation', () => {
    it('rejects note exceeding 1000 characters', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 1000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: 1750000000000,
        note: 'a'.repeat(1001),
      })

      expect(parsed.success).toBe(false)
    })
  })

  describe('strict mode', () => {
    it('rejects unknown fields', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 1000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Lunch',
        occurredAt: 1750000000000,
        unexpected: 'field',
      })

      expect(parsed.success).toBe(false)
    })
  })

  describe('sourceKey validation', () => {
    it('rejects invalid sourceKey', () => {
      const parsed = createExpenseRequestSchema().safeParse({
        amount: 1000,
        categoryKey: 'food',
        sourceKey: 'invalid-source',
        title: 'Lunch',
        occurredAt: 1750000000000,
      })

      expect(parsed.success).toBe(false)
    })
  })
})
