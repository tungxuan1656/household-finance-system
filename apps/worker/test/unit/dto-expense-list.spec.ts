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
        expect(parsed.data.payer_id).toBeUndefined()
        expect(parsed.data.visibility).toBeUndefined()
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

    it('parses a query with date_from filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        date_from: '1750000000000',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.date_from).toBe(1750000000000)
      }
    })

    it('parses a query with date_to filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        date_to: '1750100000000',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.date_to).toBe(1750100000000)
      }
    })

    it('parses a query with both date_from and date_to', () => {
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

    it('parses a query with category_key filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        category_key: 'food',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.category_key).toBe('food')
      }
    })

    it('parses a query with payer_id filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        payer_id: 'user_abc123',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.payer_id).toBe('user_abc123')
      }
    })

    it('parses a query with visibility filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        visibility: 'household',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.visibility).toBe('household')
      }
    })

    it('parses a query with household_id filter', () => {
      const parsed = expenseListQuerySchema().safeParse({
        household_id: 'hh_abc123',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.household_id).toBe('hh_abc123')
      }
    })

    it('parses a query with all filters combined', () => {
      const parsed = expenseListQuerySchema().safeParse({
        cursor: 'eyJvZmZzZXQiOjB9',
        limit: '50',
        household_id: 'hh_abc123',
        date_from: '1750000000000',
        date_to: '1750100000000',
        category_key: 'transport',
        payer_id: 'user_def456',
        visibility: 'private',
      })

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.cursor).toBe('eyJvZmZzZXQiOjB9')
        expect(parsed.data.limit).toBe(50)
        expect(parsed.data.household_id).toBe('hh_abc123')
        expect(parsed.data.date_from).toBe(1750000000000)
        expect(parsed.data.date_to).toBe(1750100000000)
        expect(parsed.data.category_key).toBe('transport')
        expect(parsed.data.payer_id).toBe('user_def456')
        expect(parsed.data.visibility).toBe('private')
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

    it('rejects negative limit', () => {
      const parsed = expenseListQuerySchema().safeParse({ limit: '-5' })

      expect(parsed.success).toBe(false)
    })

    it('rejects invalid category_key', () => {
      const parsed = expenseListQuerySchema().safeParse({
        category_key: 'nonexistent-category',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects invalid visibility', () => {
      const parsed = expenseListQuerySchema().safeParse({
        visibility: 'public',
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

    it('rejects empty string payer_id', () => {
      const parsed = expenseListQuerySchema().safeParse({
        payer_id: '',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects whitespace-only payer_id', () => {
      const parsed = expenseListQuerySchema().safeParse({
        payer_id: '   ',
      })

      expect(parsed.success).toBe(false)
    })

    it('rejects unknown fields in strict mode', () => {
      const parsed = expenseListQuerySchema().safeParse({
        unknown_field: 'should fail',
      })

      expect(parsed.success).toBe(false)
    })
  })
})
