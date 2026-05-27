import { describe, expect, it } from 'vitest'

import { expenseListQuerySchema } from '@/contracts'

describe('expense list query schema', () => {
  describe('valid payloads', () => {
    it('parses an empty query with defaults (limit = 20)', () => {
      const parsed = expenseListQuerySchema().safeParse({})

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.limit).toBe(20)
        expect(parsed.data.cursor).toBeUndefined()
        expect(parsed.data.household_id).toBeUndefined()
        expect(parsed.data.date_from).toBeUndefined()
        expect(parsed.data.date_to).toBeUndefined()
        expect(parsed.data.category_key).toBeUndefined()
        expect(parsed.data.spent_by_user_id).toBeUndefined()
      }
    })

    it('parses a query with cursor pagination', () => {
      const parsed = expenseListQuerySchema().safeParse({
        cursor: 'eyJvZmZzZXQiOjEwfQ',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.cursor).toBe('eyJvZmZzZXQiOjEwfQ')
        expect(parsed.data.limit).toBe(20)
      }
    })

    it('parses date filters', () => {
      const parsed = expenseListQuerySchema().safeParse({
        date_from: '1750000000000',
        date_to: '1750100000000',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.date_from).toBe(1750000000000)
        expect(parsed.data.date_to).toBe(1750100000000)
      }
    })

    it('parses category filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        category_key: 'food',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.category_key).toBe('food')
      }
    })

    it('parses household filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        household_id: 'hh_abc123',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.household_id).toBe('hh_abc123')
      }
    })

    it('parses note query filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        query: 'groceries',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.query).toBe('groceries')
      }
    })

    it('parses amount range filters', () => {
      const parsed = expenseListQuerySchema().safeParse({
        amount_min: '1000',
        amount_max: '5000',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.amount_min).toBe(1000)
        expect(parsed.data.amount_max).toBe(5000)
      }
    })

    it('parses spent_by_user_id filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        spent_by_user_id: 'user_abc123',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.spent_by_user_id).toBe('user_abc123')
      }
    })

    it('parses sort filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        sort: 'amount_desc',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.sort).toBe('amount_desc')
      }
    })

    it('parses all supported filters combined', () => {
      const parsed = expenseListQuerySchema().safeParse({
        cursor: 'eyJvZmZzZXQiOjB9',
        limit: '50',
        household_id: 'hh_abc123',
        date_from: '1750000000000',
        date_to: '1750100000000',
        category_key: 'transport',
        spent_by_user_id: 'user_spender123',
        query: 'rent',
        amount_min: '1000',
        amount_max: '5000',
        sort: 'occurred_at_desc',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.cursor).toBe('eyJvZmZzZXQiOjB9')
        expect(parsed.data.limit).toBe(50)
        expect(parsed.data.household_id).toBe('hh_abc123')
        expect(parsed.data.date_from).toBe(1750000000000)
        expect(parsed.data.date_to).toBe(1750100000000)
        expect(parsed.data.category_key).toBe('transport')
        expect(parsed.data.spent_by_user_id).toBe('user_spender123')
        expect(parsed.data.query).toBe('rent')
        expect(parsed.data.amount_min).toBe(1000)
        expect(parsed.data.amount_max).toBe(5000)
        expect(parsed.data.sort).toBe('occurred_at_desc')
      }
    })

    it('coerces string limit to number', () => {
      const parsed = expenseListQuerySchema().safeParse({ limit: '15' })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.limit).toBe(15)
      }
    })
  })

  describe('rejection cases', () => {
    it('rejects limit > 100', () => {
      const parsed = expenseListQuerySchema().safeParse({ limit: '101' })

      expect(parsed.success).toBe(false)
    })

    it('rejects limit < 1', () => {
      const parsed = expenseListQuerySchema().safeParse({ limit: '0' })

      expect(parsed.success).toBe(false)
    })

    it('rejects invalid category_key', () => {
      const parsed = expenseListQuerySchema().safeParse({
        category_key: 'nonexistent-category',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects non-integer date_from', () => {
      const parsed = expenseListQuerySchema().safeParse({
        date_from: 'not-a-number',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects non-integer date_to', () => {
      const parsed = expenseListQuerySchema().safeParse({
        date_to: '12.5',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects empty string spent_by_user_id', () => {
      const parsed = expenseListQuerySchema().safeParse({
        spent_by_user_id: '',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects unknown fields in strict mode', () => {
      const parsed = expenseListQuerySchema().safeParse({
        unknown_field: 'should fail',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects invalid amount_min', () => {
      const parsed = expenseListQuerySchema().safeParse({
        amount_min: 'abc',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects invalid amount_max', () => {
      const parsed = expenseListQuerySchema().safeParse({
        amount_max: 'abc',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects invalid sort option', () => {
      const parsed = expenseListQuerySchema().safeParse({
        sort: 'randomized',
      })

      expect(parsed.success).toBe(false)
    })
  })
})
