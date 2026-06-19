import { SELF, env } from 'cloudflare:test'
import { describe, expect, it, vi } from 'vitest'

import type { ApiEnvelope, ApiErrorEnvelope } from '../helpers/test-context'
import {
  exchangeAccessToken,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

import { parseExpensesWithAi } from '@/lib/ai/expense-parser'

vi.mock('@/lib/ai/expense-parser', async () => {
  const actual = await vi.importActual<
    typeof import('@/lib/ai/expense-parser')
  >('@/lib/ai/expense-parser')

  return {
    ...actual,
    parseExpensesWithAi: vi.fn(),
  }
})

registerWorkerIntegrationSetup()

/* ──────────────────────────────────────────────
 * POST /api/v1/expenses/parse — integration tests
 *
 * The AI parser module is mocked so we control AI
 * output and prove the handler's filtering, defaulting,
 * and response shape without calling any real API.
 * ────────────────────────────────────────────── */

type ParsedExpenseItem = {
  amount: number
  categoryKey: string
  sourceKey: string
  title: string
  occurredAt: string
}

type ParseExpensesResponse = {
  expenses: ParsedExpenseItem[]
  droppedCount?: number
}

describe('POST /api/v1/expenses/parse', () => {
  const defaultOccurredAt = '2026-06-19'
  const testIdToken = 'test:firebase-user-expense-parse:user-parse@example.com'

  it('returns 401 UNAUTHENTICATED when no auth token is provided', async () => {
    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text: 'ăn sáng 50k',
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(401)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('UNAUTHENTICATED')
  })

  it('returns expenses array for a valid multi-expense AI response', async () => {
    vi.mocked(parseExpensesWithAi).mockResolvedValueOnce([
      {
        amount: 50000,
        categoryKey: 'food',
        sourceKey: 'cash',
        title: 'Ăn sáng',
        occurredAt: defaultOccurredAt,
      },
      {
        amount: 10000,
        categoryKey: 'transport',
        title: 'Đi xe bus',
      },
    ])

    const auth = await exchangeAccessToken(testIdToken)

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: 'ăn sáng 50k, đi xe bus 10k',
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<ParseExpensesResponse>>(response)
    expect(payload.success).toBe(true)
    expect(Array.isArray(payload.data.expenses)).toBe(true)

    // Expect exactly two valid items
    expect(payload.data.expenses).toHaveLength(2)

    const [first, second] = payload.data.expenses

    expect(first.amount).toBe(50000)
    expect(first.categoryKey).toBe('food')
    expect(first.sourceKey).toBe('cash')
    expect(first.title).toBe('Ăn sáng')
    expect(first.occurredAt).toBe(defaultOccurredAt)

    expect(second.amount).toBe(10000)
    expect(second.categoryKey).toBe('transport')
    expect(second.sourceKey).toBe('bank-transfer')
    expect(second.title).toBe('Đi xe bus')
    expect(second.occurredAt).toBe(defaultOccurredAt)

    expect(parseExpensesWithAi).toHaveBeenLastCalledWith(
      'ăn sáng 50k, đi xe bus 10k',
      expect.objectContaining({
        apiKey: expect.any(String),
        baseUrl: expect.any(String),
        model: expect.any(String),
      }),
      { defaultOccurredAt },
    )
  })

  it('defaults sourceKey to bank-transfer and occurredAt to defaultOccurredAt when AI omits them', async () => {
    vi.mocked(parseExpensesWithAi).mockResolvedValueOnce([
      { amount: 35000, categoryKey: 'food', title: 'Cà phê sáng' },
    ])

    const auth = await exchangeAccessToken(testIdToken)

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: 'cà phê 35k',
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<ParseExpensesResponse>>(response)
    expect(payload.data.expenses).toHaveLength(1)

    const item = payload.data.expenses[0]
    expect(item.sourceKey).toBe('bank-transfer')
    expect(item.occurredAt).toBe(defaultOccurredAt)
    expect(item.amount).toBe(35000)
    expect(item.categoryKey).toBe('food')
    expect(item.title).toBe('Cà phê sáng')
  })

  it('filters out invalid AI items and includes droppedCount (N4)', async () => {
    vi.mocked(parseExpensesWithAi).mockResolvedValueOnce([
      // Invalid: bad category (not an expense kind)
      { amount: 50000, categoryKey: 'money-in', title: 'Thu nhập' },
      // Invalid: bad source
      {
        amount: 20000,
        categoryKey: 'food',
        sourceKey: 'bitcoin',
        title: 'Trái cây',
      },
      // Invalid: zero amount
      { amount: 0, categoryKey: 'food', title: 'Không' },
      // Invalid: negative amount
      { amount: -1000, categoryKey: 'food', title: 'Âm' },
      // Invalid: missing title
      { amount: 30000, categoryKey: 'food', title: '' },
      // Valid — should survive
      { amount: 15000, categoryKey: 'food', title: 'Hợp lệ' },
    ])

    const auth = await exchangeAccessToken(testIdToken)

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: 'test items with various validity',
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<ParseExpensesResponse>>(response)
    // Only the single valid item should remain
    expect(payload.data.expenses).toHaveLength(1)
    expect(payload.data.expenses[0].title).toBe('Hợp lệ')
    // droppedCount should report 5 filtered items (N4)
    expect(payload.data.droppedCount).toBe(5)
  })

  it('returns 200 with empty expenses and no droppedCount when AI returns empty list (N2 parse-empty path)', async () => {
    vi.mocked(parseExpensesWithAi).mockResolvedValueOnce([])

    const auth = await exchangeAccessToken(testIdToken)

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: 'nothing to parse',
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<ParseExpensesResponse>>(response)
    expect(payload.data.expenses).toHaveLength(0)
    // No droppedCount when nothing was dropped
    expect(payload.data.droppedCount).toBeUndefined()
  })

  it('returns 502 BAD_GATEWAY when upstream AI call fails (N2)', async () => {
    // Import real class (vi.mock retains the original export)
    const { AiUpstreamError: RealAiUpstreamError } = await vi.importActual<
      typeof import('@/lib/ai/expense-parser')
    >('@/lib/ai/expense-parser')

    vi.mocked(parseExpensesWithAi).mockRejectedValueOnce(
      new RealAiUpstreamError(),
    )

    const auth = await exchangeAccessToken(testIdToken)

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: 'trigger upstream failure',
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(502)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('BAD_GATEWAY')
    expect(payload.error.message).toBeDefined()
    // Upstream error body must NOT be exposed
    expect(payload.error.message).not.toContain('trigger upstream failure')
  })

  it('returns 400 INVALID_INPUT when text exceeds max length (N3)', async () => {
    const auth = await exchangeAccessToken(testIdToken)

    const longText = 'x'.repeat(4001)

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: longText,
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(400)

    const payload = await parseJson<ApiErrorEnvelope>(response)
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('INVALID_INPUT')
  })

  it('returns 200 when text exactly at max length (N3 boundary)', async () => {
    vi.mocked(parseExpensesWithAi).mockResolvedValueOnce([
      { amount: 25000, categoryKey: 'food', title: 'Đúng hạn' },
    ])

    const auth = await exchangeAccessToken(testIdToken)

    const exactText = 'a'.repeat(4000)

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: exactText,
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(200)
  })

  it('passes numeric amounts correctly through the handler (N7 — parser level test covers coercion)', async () => {
    vi.mocked(parseExpensesWithAi).mockResolvedValueOnce([
      // Amount is already a number (as returned by parser after coercion)
      { amount: 50000, categoryKey: 'food', title: 'Bún bò' },
      { amount: 25000.5, categoryKey: 'transport', title: 'Xe bus' },
      // Zero amounts are rejected by schema
      { amount: 0, categoryKey: 'food', title: 'Bằng không' },
      // Negative amounts are rejected by schema
      { amount: -1000, categoryKey: 'food', title: 'Âm' },
    ])

    const auth = await exchangeAccessToken(testIdToken)

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: 'test numeric amounts through handler',
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(200)

    const payload =
      await parseJson<ApiEnvelope<ParseExpensesResponse>>(response)
    // Two valid numeric amounts, two rejected (zero, negative)
    expect(payload.data.expenses).toHaveLength(2)
    expect(payload.data.droppedCount).toBe(2)
    expect(payload.data.expenses[0]!.amount).toBe(50000)
    expect(payload.data.expenses[1]!.amount).toBe(25000.5)
  })

  it('does not create expense rows in D1', async () => {
    vi.mocked(parseExpensesWithAi).mockResolvedValueOnce([
      { amount: 50000, categoryKey: 'food', title: 'Đồ ăn vặt' },
    ])

    const auth = await exchangeAccessToken(testIdToken)

    const { count: before } = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM expenses',
    ).first<{ count: number }>()

    const response = await SELF.fetch(
      'https://example.com/api/v1/expenses/parse',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: 'test item 50k',
          defaultOccurredAt,
        }),
      },
    )

    expect(response.status).toBe(200)

    const { count: after } = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM expenses',
    ).first<{ count: number }>()

    // No new expenses should have been inserted
    expect(after).toBe(before)
  })
})
