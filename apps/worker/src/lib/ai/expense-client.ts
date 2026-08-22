import { DEFAULT_AI_TIMEOUT_MS } from '@/lib/env'
import { getBaseUrlHost, logger, truncateErrorMessage } from '@/lib/logger'

import { coerceAmount } from './expense-coerce'
import { type AiContext, buildSystemPrompt } from './expense-prompt'

export type { AiContext }

export interface AiParserConfig {
  baseUrl: string
  apiKey: string
  model: string
  timeoutMs?: number
}

export interface RawAiItem {
  amount: number
  categoryKey: string
  sourceKey?: string
  title: string
  occurredAt?: string
  householdName?: string | null
  groupNames?: string[]
}

export interface ParseExpensesWithAiOptions {
  defaultOccurredAt?: string
  requestId?: string
  correlationId?: string
  context?: AiContext
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

// Re-export single source from env; webhook default 60s
export { DEFAULT_AI_TIMEOUT_MS }

const buildRequestBody = (
  model: string,
  text: string,
  options: ParseExpensesWithAiOptions = {},
): unknown => ({
  model,
  messages: [
    {
      role: 'system',
      content: buildSystemPrompt(options.defaultOccurredAt, options.context),
    },
    { role: 'user', content: text },
  ],
  response_format: { type: 'json_object' } as const,
  stream: false,
  thinking: { type: 'disabled' } as const,
  reasoning: { effort: 'none' } as const,
})

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
  const correlationId = options.requestId ?? options.correlationId
  const baseUrlHost = getBaseUrlHost(baseUrl)
  const promptChars = text.length

  const resolvedTimeoutMs =
    typeof config.timeoutMs === 'number' &&
    Number.isFinite(config.timeoutMs) &&
    config.timeoutMs > 0
      ? config.timeoutMs
      : DEFAULT_AI_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), resolvedTimeoutMs)
  const start =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now()

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

    const durationMs = Math.round(
      (typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
        ? performance.now()
        : Date.now()) - start,
    )

    if (!response.ok) {
      let errorSnippet: string | undefined
      try {
        const raw = await response.clone().text()
        if (raw) errorSnippet = raw.slice(0, 500)
      } catch {
        errorSnippet = undefined
      }

      logger.error(correlationId, 'ai_call', {
        provider: 'openai-compat',
        model: config.model,
        baseUrlHost,
        promptChars,
        defaultOccurredAt: options.defaultOccurredAt,
        status: response.status,
        durationMs,
        timeoutMs: resolvedTimeoutMs,
        errorSnippet,
      })

      // Upstream failure — do not expose the upstream error body
      throw new AiUpstreamError()
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = body?.choices?.[0]?.message?.content
    if (!content || content.length === 0) {
      logger.info(correlationId, 'ai_call', {
        provider: 'openai-compat',
        model: config.model,
        baseUrlHost,
        promptChars,
        defaultOccurredAt: options.defaultOccurredAt,
        status: response.status,
        durationMs,
        responseItemsCount: 0,
      })

      return []
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      logger.info(correlationId, 'ai_call', {
        provider: 'openai-compat',
        model: config.model,
        baseUrlHost,
        promptChars,
        defaultOccurredAt: options.defaultOccurredAt,
        status: response.status,
        durationMs,
        responseItemsCount: 0,
      })

      return []
    }

    // Accept both { expenses: [...] } and bare [...]
    const items: unknown = Array.isArray(parsed)
      ? parsed
      : ((parsed as Record<string, unknown>)?.expenses ?? [])

    if (!Array.isArray(items)) {
      logger.info(correlationId, 'ai_call', {
        provider: 'openai-compat',
        model: config.model,
        baseUrlHost,
        promptChars,
        defaultOccurredAt: options.defaultOccurredAt,
        status: response.status,
        durationMs,
        responseItemsCount: 0,
      })

      return []
    }

    // Return weakly-typed items; the handler validates/normalises them
    const mapped = items.map((item: unknown) => {
      const raw = item as Record<string, unknown>

      const householdName =
        typeof raw.householdName === 'string'
          ? raw.householdName.trim() || null
          : raw.householdName === null
            ? null
            : undefined

      const groupNamesRaw = raw.groupNames
      let groupNames: string[] | undefined
      if (Array.isArray(groupNamesRaw)) {
        const coerced = groupNamesRaw
          .filter((v): v is string => typeof v === 'string')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
        groupNames = coerced
      }

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
        householdName: householdName ?? null,
        groupNames,
      }
    })

    logger.info(correlationId, 'ai_call', {
      provider: 'openai-compat',
      model: config.model,
      baseUrlHost,
      promptChars,
      defaultOccurredAt: options.defaultOccurredAt,
      status: response.status,
      durationMs,
      timeoutMs: resolvedTimeoutMs,
      responseItemsCount: mapped.length,
    })

    return mapped
  } catch (error) {
    if (error instanceof AiUpstreamError) throw error

    const durationMs = Math.round(
      (typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
        ? performance.now()
        : Date.now()) - start,
    )
    const isTimeout =
      (error instanceof DOMException && error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'AbortError')
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    const errorMessage =
      error instanceof Error
        ? truncateErrorMessage(error.message)
        : truncateErrorMessage(String(error))

    logger.error(correlationId, 'ai_call', {
      provider: 'openai-compat',
      model: config.model,
      baseUrlHost,
      promptChars,
      defaultOccurredAt: options.defaultOccurredAt,
      durationMs,
      timeoutMs: resolvedTimeoutMs,
      errorName,
      errorMessage,
      isTimeout,
    })

    // Network errors, aborts → upstream failure
    throw new AiUpstreamError()
  } finally {
    clearTimeout(timer)
  }
}
