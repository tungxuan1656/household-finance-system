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

// 20s timeout — feature assumes Workers paid-plan 30s wall
const AI_TIMEOUT_MS = 20_000

const buildSystemPrompt = (): string =>
  [
    'You are an expense parser for a personal finance app. Extract expenses from Vietnamese text.',
    'Respond with a JSON object containing an "expenses" array.',
    'Each expense object must have:',
    '- amount (positive number, in VND)',
    '- categoryKey (string — pick the best match from the allowed list below)',
    '- sourceKey (optional string — pick from the allowed list, default bank-transfer)',
    '- title (string, short description of the expense)',
    '- occurredAt (optional string, YYYY-MM-DD format — infer from context or leave absent)',
    '',
    'Allowed categoryKey values: food, transport, dating, living-costs, family, children, relatives, shopping, beauty, health, social, repairs, work, education, investment, self-development, sports, travel, hobbies, pets, charity, other',
    'Allowed sourceKey values: cash, bank-transfer, card, momo, zalo-pay, shopee-pay, other',
    '',
    'Return ONLY the JSON object, no markdown, no explanation.',
  ].join('\n')

const buildRequestBody = (model: string, text: string): unknown => ({
  model,
  messages: [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: text },
  ],
  response_format: { type: 'json_object' } as const,
  stream: false,
})

/**
 * Calls the OpenAI-compatible chat completions endpoint and returns
 * raw items parsed from the model response.
 *
 * Returns an empty array on any parse failure — never throws for bad AI output.
 */
export const parseExpensesWithAi = async (
  text: string,
  config: AiParserConfig,
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
      body: JSON.stringify(buildRequestBody(config.model, text)),
      signal: controller.signal,
    })

    if (!response.ok) {
      // Do not expose the upstream error body to the client
      return []
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
        amount: typeof raw.amount === 'number' ? raw.amount : 0,
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
  } catch {
    // Network errors, aborts, JSON parse failures → empty
    return []
  } finally {
    clearTimeout(timer)
  }
}
