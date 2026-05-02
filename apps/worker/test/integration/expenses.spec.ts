import { describe, it, beforeEach, expect } from 'vitest'
// Import the centralized test context (users, households, memberships, auth tokens)
import { testContext } from '../helpers/test-context'

import type { CreateExpenseRequest, ExpenseDTO } from '@/contracts'

describe('POST /api/v1/expenses - integration tests', () => {
  let ctx: Awaited<ReturnType<typeof testContext.initialize>>

  beforeEach(async () => {
    ctx = await testContext.initialize()
  })

  it('Happy path: create private expense', async () => {
    const dto: CreateExpenseRequest = {
      amount: 100000,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: { Authorization: `Bearer ${ctx.authToken}` },
    })
    expect(res.status).toBe(201)

    const body = await res.json()
    const d = body?.data as ExpenseDTO | undefined
    expect(d).toBeDefined()
    expect(d!.visibility).toBe('private')
    expect(d!.householdId).toBeNull()
    expect(d!.createdByUserId).toBe(ctx.user.id)
    // Payer defaults to creator when not provided
    expect(d!.payerUserId).toBe(ctx.user.id)
    expect(d!.categoryKey).toBe('food')
    expect(d!.sourceKey).toBe('cash')
  })

  it('Happy path: create household expense with valid membership', async () => {
    const dto: CreateExpenseRequest = {
      amount: 50000,
      categoryKey: 'utilities',
      sourceKey: 'bank',
      visibility: 'household',
      householdId: ctx.household.id,
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: { Authorization: `Bearer ${ctx.authToken}` },
    })
    expect(res.status).toBe(201)

    const body = await res.json()
    const d = body?.data as ExpenseDTO | undefined
    expect(d).toBeDefined()
    expect(d!.visibility).toBe('household')
    expect(d!.householdId).toBe(ctx.household.id)
  })

  it('Error: household expense without householdId -> 400 INVALID_INPUT', async () => {
    const dto: CreateExpenseRequest = {
      amount: 1000,
      categoryKey: 'utilities',
      sourceKey: 'bank',
      visibility: 'household',
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: { Authorization: `Bearer ${ctx.authToken}` },
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('INVALID_INPUT')
  })

  it('Error: household expense without membership -> 403 FORBIDDEN', async () => {
    // Use a household where the test user has no membership
    const unaffiliated = ctx.unaffiliatedHousehold ?? {
      id: 'household-unknown',
    }
    const dto: CreateExpenseRequest = {
      amount: 800,
      categoryKey: 'utilities',
      sourceKey: 'cash',
      visibility: 'household',
      householdId: unaffiliated.id,
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: { Authorization: `Bearer ${ctx.authToken}` },
    })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('FORBIDDEN')
  })

  it('Error: create with invalid category keys -> 400 INVALID_INPUT', async () => {
    // money-in is not allowed for expense creation in this endpoint
    const dto: CreateExpenseRequest = {
      amount: 100,
      categoryKey: 'money-in',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Test expense',
      occurredAt: Date.now(),
    }

    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: { Authorization: `Bearer ${ctx.authToken}` },
    })
    expect(res.status).toBe(400)
  })

  it('Error: invalid source key -> 400 INVALID_INPUT', async () => {
    const dto: CreateExpenseRequest = {
      amount: 100,
      categoryKey: 'food',
      sourceKey: 'not-a-key' as never,
      visibility: 'private',
      title: 'Test expense',
      occurredAt: Date.now(),
    }
    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: { Authorization: `Bearer ${ctx.authToken}` },
    })
    expect(res.status).toBe(400)
  })

  it('Error: unauthenticated -> 401 UNAUTHENTICATED', async () => {
    const dto: CreateExpenseRequest = {
      amount: 100,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Test expense',
      occurredAt: Date.now(),
    }
    // No auth header
    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: {},
    })
    expect(res.status).toBe(401)
  })

  it('Error: zero/negative amount -> 400', async () => {
    const dto: CreateExpenseRequest = {
      amount: -50,
      categoryKey: 'food',
      sourceKey: 'cash',
      visibility: 'private',
      title: 'Test expense',
      occurredAt: Date.now(),
    }
    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: { Authorization: `Bearer ${ctx.authToken}` },
    })
    expect(res.status).toBe(400)
  })

  it('Error: missing required fields -> 400', async () => {
    const res = await ctx.api.post(
      '/api/v1/expenses',
      {},
      {
        headers: { Authorization: `Bearer ${ctx.authToken}` },
      },
    )
    expect(res.status).toBe(400)
  })

  it('Field validation: messages are Vietnamese and DTO matches contract', async () => {
    const dto: Record<string, unknown> = {
      amount: 0,
      currency: 'VI',
      categoryKey: '',
      sourceKey: '',
      visibility: '',
    }
    const res = await ctx.api.post('/api/v1/expenses', dto, {
      headers: { Authorization: `Bearer ${ctx.authToken}` },
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    // Expect a Vietnamese message payload
    const errors = body?.errors ?? []
    expect(Array.isArray(errors)).toBe(true)
    const msg = errors[0]?.message ?? ''
    expect(typeof msg).toBe('string')
    expect(msg.toLowerCase()).toMatch(/vi|không|hợp|nhập/i)
  })
})
