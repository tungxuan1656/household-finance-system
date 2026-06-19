import { afterEach, describe, expect, it, vi } from 'vitest'

import { AiUpstreamError, parseExpensesWithAi } from '@/lib/ai/expense-parser'
import type { AiParserConfig } from '@/lib/ai/expense-parser'

/* ──────────────────────────────────────────────
 * Unit tests for parseExpensesWithAi
 *
 * These test the parser's HTTP-fetching logic and
 * amount-coercion (N7) by mocking globalThis.fetch.
 * ────────────────────────────────────────────── */

const testConfig: AiParserConfig = {
  baseUrl: 'https://api.openai.com',
  apiKey: 'test-key',
  model: 'gpt-4o-mini',
}

const mockAiResponse = (expensesJson: string): Response =>
  new Response(
    JSON.stringify({
      choices: [{ message: { content: expensesJson } }],
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    },
  )

describe('parseExpensesWithAi — upstream errors (N2)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws AiUpstreamError for non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Internal Server Error', { status: 500 }),
    )

    await expect(parseExpensesWithAi('test text', testConfig)).rejects.toThrow(
      AiUpstreamError,
    )
  })

  it('throws AiUpstreamError for network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('fetch failed'),
    )

    await expect(parseExpensesWithAi('test text', testConfig)).rejects.toThrow(
      AiUpstreamError,
    )
  })

  it('throws AiUpstreamError for abort/timeout', async () => {
    const abortError = new DOMException(
      'The operation was aborted',
      'AbortError',
    )
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(abortError)

    await expect(parseExpensesWithAi('test text', testConfig)).rejects.toThrow(
      AiUpstreamError,
    )
  })
})

describe('parseExpensesWithAi — parse-empty paths', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty array when response has no choices', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ choices: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const result = await parseExpensesWithAi('no choices', testConfig)
    expect(result).toEqual([])
  })

  it('returns empty array when response has no content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: null } }],
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    )

    const result = await parseExpensesWithAi('null content', testConfig)
    expect(result).toEqual([])
  })

  it('returns empty array when content is not valid JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'not json' } }],
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    )

    const result = await parseExpensesWithAi('bad json', testConfig)
    expect(result).toEqual([])
  })

  it('returns empty array when parsed content is not an object/array with expenses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockAiResponse('"just a string"'),
    )

    const result = await parseExpensesWithAi('string response', testConfig)
    expect(result).toEqual([])
  })

  it('returns empty array when expenses key holds non-array value', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockAiResponse('{"expenses": "not-an-array"}'),
    )

    const result = await parseExpensesWithAi('expenses not array', testConfig)
    expect(result).toEqual([])
  })
})

describe('parseExpensesWithAi — amount coercion (N7)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('passes number amounts through unchanged', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockAiResponse(
        JSON.stringify({
          expenses: [{ amount: 50000, categoryKey: 'food', title: 'Ăn sáng' }],
        }),
      ),
    )

    const result = await parseExpensesWithAi('test', testConfig)
    expect(result).toHaveLength(1)
    expect(result[0]!.amount).toBe(50000)
  })

  it('coerces numeric string amounts to numbers', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockAiResponse(
        JSON.stringify({
          expenses: [
            {
              amount: '50000',
              categoryKey: 'food',
              title: 'Bún bò',
            },
          ],
        }),
      ),
    )

    const result = await parseExpensesWithAi('numeric string', testConfig)
    expect(result).toHaveLength(1)
    expect(result[0]!.amount).toBe(50000)
  })

  it('coerces decimal string amounts to numbers', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockAiResponse(
        JSON.stringify({
          expenses: [
            {
              amount: '25000.5',
              categoryKey: 'transport',
              title: 'Xe bus',
            },
          ],
        }),
      ),
    )

    const result = await parseExpensesWithAi('decimal string', testConfig)
    expect(result).toHaveLength(1)
    expect(result[0]!.amount).toBe(25000.5)
  })

  it('sets amount to 0 for non-numeric strings (handled by schema)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockAiResponse(
        JSON.stringify({
          expenses: [
            {
              amount: 'not-a-number',
              categoryKey: 'food',
              title: 'Invalid',
            },
          ],
        }),
      ),
    )

    const result = await parseExpensesWithAi('NaN string', testConfig)
    expect(result).toHaveLength(1)
    expect(result[0]!.amount).toBe(0)
  })

  it('sets amount to 0 for negative numeric strings', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockAiResponse(
        JSON.stringify({
          expenses: [
            {
              amount: '-1000',
              categoryKey: 'food',
              title: 'Negative',
            },
          ],
        }),
      ),
    )

    const result = await parseExpensesWithAi('negative string', testConfig)
    expect(result).toHaveLength(1)
    expect(result[0]!.amount).toBe(0)
  })

  it('sets amount to 0 for empty string', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockAiResponse(
        JSON.stringify({
          expenses: [
            {
              amount: '',
              categoryKey: 'food',
              title: 'Empty',
            },
          ],
        }),
      ),
    )

    const result = await parseExpensesWithAi('empty string', testConfig)
    expect(result).toHaveLength(1)
    expect(result[0]!.amount).toBe(0)
  })
})

describe('parseExpensesWithAi — prompt date context', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends current date, relative date, and explicit format rules to the AI prompt', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockAiResponse('{"expenses": []}'))

    await parseExpensesWithAi('11/6: đèn học 145k', testConfig, {
      defaultOccurredAt: '2026-06-19',
    })

    const requestBody = JSON.parse(
      fetchSpy.mock.calls[0]![1]!.body as string,
    ) as {
      messages: Array<{ role: string; content: string }>
    }

    const systemPrompt = requestBody.messages[0]!.content

    expect(systemPrompt).toContain('2026-06-19')
    expect(systemPrompt).toContain('Treat this as today/current time')
    expect(systemPrompt).toContain('hôm qua')
    expect(systemPrompt).toContain('ngày này tháng trước')
    expect(systemPrompt).toContain('DD/MM')
    expect(systemPrompt).toContain('YYYY/MM/DD')
    expect(systemPrompt).toContain('YYYY-MM-DD')
    expect(systemPrompt).toContain(
      'set occurredAt to the current client-local date',
    )
    expect(systemPrompt).toContain('"11/6: đèn học 145k"')
    expect(systemPrompt).toContain('"2026-06-11"')
  })
})
