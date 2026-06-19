/**
 * OpenAI-compatible chat completions client for expense parsing.
 *
 * Strips trailing slashes from baseUrl, appends /chat/completions,
 * and uses response_format: json_object to force valid JSON output.
 * Never logs the raw user text.
 */

export interface AiParserConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export interface RawAiItem {
  amount: number
  categoryKey: string
  sourceKey?: string
  title: string
  occurredAt?: string
}

export interface ParseExpensesWithAiOptions {
  defaultOccurredAt?: string
}

/**
 * Thrown when the upstream AI service returns a non-2xx status,
 * a network error occurs, or the request is aborted (timeout).
 * Distinguishable from "AI returned no parseable expenses".
 */
export class AiUpstreamError extends Error {
  constructor() {
    super('AI upstream service failure')
    this.name = 'AiUpstreamError'
  }
}

// 20s timeout — feature assumes Workers paid-plan 30s wall
const AI_TIMEOUT_MS = 20_000

const buildSystemPrompt = (defaultOccurredAt?: string): string =>
  [
    'You are an expense parser for a personal finance app. Extract expenses from Vietnamese text.',
    'Respond with a JSON object containing an "expenses" array.',
    'Each expense object must have:',
    '- amount (positive number, in VND)',
    '- categoryKey (string — pick the best match from the allowed list below)',
    '- sourceKey (optional string — pick from the allowed list, default bank-transfer)',
    '- title (string, short description of the expense)',
    '- occurredAt (string, YYYY-MM-DD format — infer from text and current date)',
    '',
    'Date rules:',
    `- The current client-local date is ${defaultOccurredAt ?? 'not provided'}. Treat this as today/current time for all date inference.`,
    '- Infer relative Vietnamese date expressions against the current date: hôm nay, hôm qua, hôm kia, ngày mai, ngày kia, tuần trước, tháng trước, ngày này tháng trước, etc.',
    '- Supported explicit date formats include DD/MM, D/M, YYYY/MM/DD, YYYY-MM-DD, and DD-MM. Parse day/month formats as day/month, not month/day.',
    '- When the text gives only day/month, use the year from the current date.',
    '- If the text has no date information, set occurredAt to the current client-local date.',
    '- Example: with default date 2026-06-19, "11/6: đèn học 145k" must produce occurredAt "2026-06-11".',
    '',
    'Allowed categoryKey values: food, transport, dating, living-costs, family, children, relatives, shopping, beauty, health, social, repairs, work, education, investment, self-development, sports, travel, hobbies, pets, charity, other',
    'Allowed sourceKey values: cash, bank-transfer, card, momo, zalo-pay, shopee-pay, other',
    '',
    'Return ONLY the JSON object, no markdown, no explanation.',
  ].join('\n')

const buildRequestBody = (
  model: string,
  text: string,
  options: ParseExpensesWithAiOptions = {},
): unknown => ({
  model,
  messages: [
    { role: 'system', content: buildSystemPrompt(options.defaultOccurredAt) },
    { role: 'user', content: text },
  ],
  response_format: { type: 'json_object' } as const,
  stream: false,
})

/**
 * Safely coerce an AI-provided amount to a number.
 *
 * - Numbers pass through.
 * - Numeric strings ("50000") are converted.
 * - NaN, Infinity, negative values are returned as undefined
 *   so the handler schema (positive()) can reject them cleanly.
 */
const coerceAmount = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length === 0) return undefined

    const n = Number(trimmed)

    return Number.isFinite(n) && n > 0 ? n : undefined
  }

  return undefined
}

/**
 * Calls the OpenAI-compatible chat completions endpoint and returns
 * raw items parsed from the model response.
 *
 * Throws {@link AiUpstreamError} for upstream non-2xx / network / abort failures.
 * Returns an empty array when the model responds OK but yields no parseable content.
 */
export const parseExpensesWithAi = async (
  text: string,
  config: AiParserConfig,
  options: ParseExpensesWithAiOptions = {},
): Promise<RawAiItem[]> => {
  const baseUrl = config.baseUrl.replace(/\/+$/, '')
  const url = `${baseUrl}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(config.model, text, options)),
      signal: controller.signal,
    })

    if (!response.ok) {
      // Upstream failure — do not expose the upstream error body
      throw new AiUpstreamError()
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = body?.choices?.[0]?.message?.content
    if (!content || content.length === 0) {
      return []
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      return []
    }

    // Accept both { expenses: [...] } and bare [...]
    const items: unknown = Array.isArray(parsed)
      ? parsed
      : ((parsed as Record<string, unknown>)?.expenses ?? [])

    if (!Array.isArray(items)) {
      return []
    }

    // Return weakly-typed items; the handler validates/normalises them
    return items.map((item: unknown) => {
      const raw = item as Record<string, unknown>

      return {
        amount: coerceAmount(raw.amount) ?? 0,
        categoryKey:
          typeof raw.categoryKey === 'string' ? raw.categoryKey.trim() : '',
        sourceKey:
          typeof raw.sourceKey === 'string' ? raw.sourceKey.trim() : undefined,
        title: typeof raw.title === 'string' ? raw.title.trim() : '',
        occurredAt:
          typeof raw.occurredAt === 'string'
            ? raw.occurredAt.trim()
            : undefined,
      }
    })
  } catch (error) {
    if (error instanceof AiUpstreamError) throw error
    // Network errors, aborts → upstream failure
    throw new AiUpstreamError()
  } finally {
    clearTimeout(timer)
  }
}
