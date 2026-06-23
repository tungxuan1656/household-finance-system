/**
 * Vietnamese amount detector — pattern definitions and helpers.
 *
 * Contains all regex constants, matching helpers, and classification logic
 * used by detectAmountInVnd and looksLikeExpense.
 */

// ── Spending verbs — có verb chi tiêu → expense intent ──────────────────────
export const SPEND_VERBS = new Set([
  'mua',
  'trả',
  'ăn',
  'đổ',
  'cà phê',
  'cafe',
  'taxi',
  'grab',
  'bún',
  'phở',
  'cơm',
  'vé',
  'sữa',
  'bỉm',
  'thuốc',
  'xăng',
  'gửi xe',
  'nhậu',
  'tiệc',
  'cưới',
  'khám',
  'sửa',
  'nạp',
  'đóng',
  'mua sắm',
])

// ── Income/transfer rejection words — nếu có mà không có spend verb → reject ─
export const INCOME_WORDS = [
  'nhận',
  'được',
  'vay',
  'chuyển khoản đến',
  'tặng',
  'chuyển khoản cho',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check if text contains any of the given words (case-insensitive, word-boundary).
 */
export const containsAnyWord = (
  text: string,
  words: string[] | Set<string>,
): boolean => {
  const lower = text.toLowerCase()

  for (const word of words) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(^|\\s)${escaped}($|\\s|[.,;!?])`)

    if (re.test(lower)) return true
  }

  return false
}

/**
 * Check if text has income/transfer words (like "nhận", "vay") and check
 * for the presence of spend verbs.
 *
 * Returns:
 *   'income'   — income words present, NO spend verb → reject
 *   'ambiguous' — both income and spend present → reject
 *   'expense'   — no income words, or income + spend → OK (spend intent clear)
 */
export const classifyIntent = (
  text: string,
): 'income' | 'ambiguous' | 'expense' => {
  const lowerText = text.toLowerCase()
  const hasIncome = containsAnyWord(lowerText, INCOME_WORDS)
  const hasSpend = containsAnyWord(lowerText, SPEND_VERBS)

  if (hasIncome && !hasSpend) return 'income'
  if (hasIncome && hasSpend) return 'ambiguous'

  return 'expense'
}

/**
 * Remove dots from a Vietnamese number string for uniform parsing.
 */
export const stripThousandSeparators = (s: string): string =>
  s.replace(/\./g, '')

/**
 * Check if a raw numeric string looks like a valid plain amount.
 */
export const isValidPlainNumber = (numStr: string): boolean => {
  const n = parseInt(numStr, 10)

  if (Number.isNaN(n)) return false
  if (n < 1000 || n > 999_999_999_999) return false

  // Reject if number ends with exactly 2 zeros (ambiguous: 200, 1500)
  if (/00$/.test(numStr) && !/000$/.test(numStr)) return false

  return true
}

/**
 * Extract the matched substring from original text given a RegExpExecArray.
 */
export const matchedText = (text: string, match: RegExpExecArray): string =>
  text.slice(match.index, match.index + match[0].length)
