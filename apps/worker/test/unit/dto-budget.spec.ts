import { describe, expect, it } from 'vitest'

import {
  budgetListQuerySchema,
  budgetPathParamsSchema,
  createBudgetBodySchema,
  updateBudgetRequestSchema,
} from '@/contracts'

describe('budget contract schema', () => {
  describe('createBudgetBodySchema', () => {
    describe('valid payloads', () => {
      it('accepts minimal valid household payload', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 500000,
        })

        expect(parsed.success).toBe(true)
        if (parsed.success) {
          expect(parsed.data.scope).toBe('household')
          expect(parsed.data.categoryLimits).toEqual([])
        }
      })

      it('accepts minimal valid personal payload with currencyCode', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'personal',
          currencyCode: 'VND',
          period: '2026-05',
          totalLimit: 500000,
        })

        expect(parsed.success).toBe(true)
        if (parsed.success) {
          expect(parsed.data.scope).toBe('personal')
          expect(parsed.data.currencyCode).toBe('VND')
        }
      })

      it('accepts full valid payload with categoryLimits', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 1000000,
          categoryLimits: [
            { categoryKey: 'food', limitMinor: 300000 },
            { categoryKey: 'transport', limitMinor: 150000 },
          ],
        })

        expect(parsed.success).toBe(true)
        if (parsed.success) {
          expect(parsed.data.categoryLimits).toHaveLength(2)
        }
      })

      it.each(['2026-01', '2026-09', '2026-12'])(
        'accepts valid period %s',
        (period) => {
          const parsed = createBudgetBodySchema().safeParse({
            scope: 'household',
            period,
            totalLimit: 1000,
          })

          expect(parsed.success).toBe(true)
        },
      )

      it('accepts empty categoryLimits array', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 1000,
          categoryLimits: [],
        })

        expect(parsed.success).toBe(true)
        if (parsed.success) {
          expect(parsed.data.categoryLimits).toEqual([])
        }
      })
    })

    describe('validation errors', () => {
      it.each(['2026-5', '2026-13', 'not-a-period'])(
        'rejects invalid period %s',
        (period) => {
          const parsed = createBudgetBodySchema().safeParse({
            scope: 'household',
            period,
            totalLimit: 1000,
          })

          expect(parsed.success).toBe(false)
        },
      )

      it('rejects zero totalLimit', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 0,
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects negative totalLimit', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: -1,
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects non-integer totalLimit', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 1000.5,
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects totalLimit exceeding max', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 1000000000000,
        })

        expect(parsed.success).toBe(false)
      })

      it.each(['money-in', 'lending', 'nonexistent'])(
        'rejects invalid categoryKey %s',
        (categoryKey) => {
          const parsed = createBudgetBodySchema().safeParse({
            scope: 'household',
            period: '2026-05',
            totalLimit: 1000,
            categoryLimits: [{ categoryKey, limitMinor: 100 }],
          })

          expect(parsed.success).toBe(false)
        },
      )

      it('rejects zero limitMinor in categoryLimits', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 1000,
          categoryLimits: [{ categoryKey: 'food', limitMinor: 0 }],
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects negative limitMinor in categoryLimits', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 1000,
          categoryLimits: [{ categoryKey: 'food', limitMinor: -1 }],
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects duplicate categoryKeys in categoryLimits', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 1000,
          categoryLimits: [
            { categoryKey: 'food', limitMinor: 100 },
            { categoryKey: 'food', limitMinor: 200 },
          ],
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects unknown fields', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
          totalLimit: 1000,
          unknownField: 'should fail',
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects missing period', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          totalLimit: 1000,
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects missing totalLimit', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'household',
          period: '2026-05',
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects missing scope', () => {
        const parsed = createBudgetBodySchema().safeParse({
          period: '2026-05',
          totalLimit: 1000,
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects personal scope without currencyCode', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'personal',
          period: '2026-05',
          totalLimit: 1000,
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects invalid scope', () => {
        const parsed = createBudgetBodySchema().safeParse({
          scope: 'category',
          period: '2026-05',
          totalLimit: 1000,
        })

        expect(parsed.success).toBe(false)
      })
    })
  })

  describe('updateBudgetRequestSchema', () => {
    describe('valid payloads', () => {
      it('accepts update with totalLimit only', () => {
        const parsed = updateBudgetRequestSchema().safeParse({
          totalLimit: 500000,
        })

        expect(parsed.success).toBe(true)
      })

      it('accepts update with categoryLimits only', () => {
        const parsed = updateBudgetRequestSchema().safeParse({
          categoryLimits: [{ categoryKey: 'food', limitMinor: 300000 }],
        })

        expect(parsed.success).toBe(true)
      })

      it('accepts update with both totalLimit and categoryLimits', () => {
        const parsed = updateBudgetRequestSchema().safeParse({
          totalLimit: 1000000,
          categoryLimits: [
            { categoryKey: 'food', limitMinor: 300000 },
            { categoryKey: 'transport', limitMinor: 150000 },
          ],
        })

        expect(parsed.success).toBe(true)
      })
    })

    describe('validation errors', () => {
      it('rejects empty body', () => {
        const parsed = updateBudgetRequestSchema().safeParse({})

        expect(parsed.success).toBe(false)
      })

      it('rejects zero totalLimit', () => {
        const parsed = updateBudgetRequestSchema().safeParse({
          totalLimit: 0,
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects invalid categoryKey', () => {
        const parsed = updateBudgetRequestSchema().safeParse({
          categoryLimits: [{ categoryKey: 'money-in', limitMinor: 100 }],
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects duplicate categoryKeys', () => {
        const parsed = updateBudgetRequestSchema().safeParse({
          categoryLimits: [
            { categoryKey: 'food', limitMinor: 100 },
            { categoryKey: 'food', limitMinor: 200 },
          ],
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects unknown fields', () => {
        const parsed = updateBudgetRequestSchema().safeParse({
          totalLimit: 1000,
          unknownField: 'should fail',
        })

        expect(parsed.success).toBe(false)
      })
    })
  })

  describe('budgetPathParamsSchema', () => {
    describe('valid payloads', () => {
      it('accepts valid id', () => {
        const parsed = budgetPathParamsSchema().safeParse({
          id: 'budget_abc123',
        })

        expect(parsed.success).toBe(true)
      })
    })

    describe('validation errors', () => {
      it('rejects blank id', () => {
        const parsed = budgetPathParamsSchema().safeParse({
          id: '   ',
        })

        expect(parsed.success).toBe(false)
      })
    })
  })

  describe('budgetListQuerySchema', () => {
    describe('valid payloads', () => {
      it('accepts household_id only', () => {
        const parsed = budgetListQuerySchema().safeParse({
          household_id: 'hh_abc123',
        })

        expect(parsed.success).toBe(true)
      })

      it('accepts household_id with period', () => {
        const parsed = budgetListQuerySchema().safeParse({
          household_id: 'hh_abc123',
          period: '2026-05',
        })

        expect(parsed.success).toBe(true)
      })

      it('accepts no filters (unioned list)', () => {
        const parsed = budgetListQuerySchema().safeParse({})

        expect(parsed.success).toBe(true)
      })

      it('accepts scope=personal', () => {
        const parsed = budgetListQuerySchema().safeParse({
          scope: 'personal',
        })

        expect(parsed.success).toBe(true)
      })

      it('accepts scope=household with household_id', () => {
        const parsed = budgetListQuerySchema().safeParse({
          household_id: 'hh_abc123',
          scope: 'household',
        })

        expect(parsed.success).toBe(true)
      })
    })

    describe('validation errors', () => {
      it('rejects invalid period format', () => {
        const parsed = budgetListQuerySchema().safeParse({
          household_id: 'hh_abc123',
          period: '2026-5',
        })

        expect(parsed.success).toBe(false)
      })

      it('rejects invalid scope', () => {
        const parsed = budgetListQuerySchema().safeParse({
          scope: 'category',
        })

        expect(parsed.success).toBe(false)
      })
    })
  })
})
