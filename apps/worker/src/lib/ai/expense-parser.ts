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
    'Only extract expenses (money spent). Do not include income, money received, salary, gifts received, lending, borrowing, debt repayment, or transfers between own accounts.',
    'Extract at most 50 expenses. If the text contains more, extract the most clearly identifiable expenses.',
    'Each expense object must have:',
    '- amount (positive number, in VND; parse Vietnamese amounts: 145k = 145000, 20 nghìn = 20000, 1tr5 = 1500000, 20 triệu = 20000000)',
    '- categoryKey (string — pick the best match from the allowed list below)',
    '- sourceKey (string — pick from the allowed list below; if unsure, use bank-transfer)',
    '- title (string, short description of the expense)',
    '- occurredAt (string, YYYY-MM-DD format — infer from text and current date)',
    '',
    'Date rules:',
    `- The current client-local date is ${defaultOccurredAt ?? 'not provided'}. Treat this as today/current time for all date inference.`,
    '- Infer Vietnamese relative dates against the current date: hôm nay/sáng nay/trưa nay/chiều nay/tối nay, hôm qua/tối qua/hôm kia, ngày mai/ngày kia, cách đây X ngày/tuần/tháng, tuần trước, tháng trước, ngày này tháng trước, đầu tháng, cuối tháng trước, năm ngoái/năm trước.',
    '- Supported explicit date formats include DD/MM, D/M, YYYY/MM/DD, YYYY-MM-DD, and DD-MM. Parse day/month formats as day/month, not month/day.',
    '- When the text gives only day/month, use the year from the current date.',
    '- If the text has no date information, set occurredAt to the current client-local date.',
    '- Example: with default date 2026-06-19, input "11/6: đèn học 145k" must produce {"expenses":[{"amount":145000,"categoryKey":"education","sourceKey":"bank-transfer","title":"đèn học","occurredAt":"2026-06-11"}]}',
    '',
    'Allowed categoryKey values: food, transport, dating, living-costs, family, children, relatives, shopping, beauty, health, social, repairs, work, education, investment, self-development, sports, travel, hobbies, pets, charity, other',
    'Category mapping hints (Vietnamese text → categoryKey):',
    '- food: ăn uống, ăn sáng, cơm, bún, phở, nhà hàng, cà phê, trà sữa, đồ ăn, nước uống',
    '- transport: xăng, gửi xe, taxi, grab, bus, xe ôm, vé xe, đi lại, sửa xe nhỏ khi đi đường',
    '- dating: hẹn hò, đi chơi với người yêu, quà cho người yêu, ăn uống hẹn hò',
    '- living-costs: tiền điện, tiền nước, internet, thuê nhà, tiền nhà, gas, sinh hoạt phí, điện thoại',
    '- family: bố mẹ, vợ chồng, gia đình, đồ dùng gia đình, chi tiêu chung gia đình',
    '- children: con cái, sữa, bỉm, đồ chơi, học phí của con, quần áo trẻ em',
    '- relatives: họ hàng, ông bà, cô dì chú bác, anh chị em, biếu họ hàng',
    '- shopping: mua sắm, quần áo, giày dép, đồ dùng cá nhân, đồ gia dụng',
    '- beauty: mỹ phẩm, làm tóc, nail, spa, chăm sóc da, làm đẹp',
    '- health: thuốc, bệnh viện, khám bệnh, nha khoa, bảo hiểm sức khỏe',
    '- social: nhậu, tiệc, liên hoan, cưới, sinh nhật bạn bè, gặp bạn, xã giao',
    '- repairs: sửa chữa, bảo trì, thay linh kiện, sửa nhà, sửa điện nước',
    '- work: công việc, văn phòng, dụng cụ làm việc, tiếp khách công việc',
    '- education: học tập, sách, khóa học, học phí, bút, vở, đèn học, tài liệu',
    '- investment: đầu tư, chứng khoán, crypto, vàng, góp vốn',
    '- self-development: phát triển bản thân, gym học kỹ năng, sách kỹ năng, workshop',
    '- sports: thể thao, gym, yoga, bóng đá, cầu lông, dụng cụ tập',
    '- travel: du lịch, khách sạn, vé máy bay, vé tàu, tour, tham quan',
    '- hobbies: sở thích, game, nhạc cụ, sưu tầm, giải trí cá nhân',
    '- pets: thú cưng, chó mèo, đồ ăn pet, khám thú y',
    '- charity: từ thiện, quyên góp, ủng hộ',
    '- other: only when it is clearly an expense but no category above fits',
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
  thinking: { type: 'disabled' } as const,
  reasoning: { effort: 'none' } as const,
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
