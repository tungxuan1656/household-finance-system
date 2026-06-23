/**
 * Vietnamese amount detector — pure functions, no Telegram/DB deps.
 *
 * Detects expense amounts in natural Vietnamese text.
 * Chỉ phát hiện số tiền chi tiêu (expense), không phải thu nhập/chuyển khoản.
 *
 * detectAmountInVnd — tìm số tiền VND trong text. Trả về {amountVnd, matched} hoặc null.
 * looksLikeExpense  — kiểm tra text có phải là chi tiêu không.
 *
 * Quy tắc reject income/transfer:
 * - Nếu text có từ chối (nhận, được, vay, ...) mà KHÔNG có verb chi → reject
 * - Nếu có cả từ chối và verb chi → mập mờ → reject
 */

import {
  classifyIntent,
  containsAnyWord,
  INCOME_WORDS,
  isValidPlainNumber,
  matchedText,
  SPEND_VERBS,
  stripThousandSeparators,
} from './vn-amount-patterns'

// ── Main detection patterns ──────────────────────────────────────────────────

/**
 * Try all amount patterns against text.
 * Returns the first match or null.
 *
 * Also checks income/transfer context — if text appears to be income/transfer
 * rather than expense, returns null.
 */
export const detectAmountInVnd = (
  text: string,
): { amountVnd: number; matched: string } | null => {
  const lowerText = text.toLowerCase()

  // ── Pattern 1: n.k (e.g. 1.5k, 30k, 100k) ──
  // Word boundary after 'k' prevents matching "kg", "km", "kWh" (units, not money).
  const kPattern = /(\d+(?:\.\d+)?)\s*k\b/i
  let match = kPattern.exec(lowerText)

  if (match) {
    const num = parseFloat(match[1]!)
    const amount = Math.round(num * 1000)

    if (amount >= 1000 && classifyIntent(text) === 'expense') {
      return { amountVnd: amount, matched: matchedText(text, match) }
    }
  }

  // ── Pattern 2: n triệu (e.g. 1 triệu, 2.5 triệu) ──
  // MUST be checked BEFORE trPattern to avoid partial match "1 tr"
  const trieuPattern = /(\d+(?:\.\d+)?)\s*triệu/i
  match = trieuPattern.exec(lowerText)

  if (match) {
    const num = parseFloat(match[1]!)
    const amount = Math.round(num * 1_000_000)

    if (amount >= 1000 && classifyIntent(text) === 'expense') {
      return { amountVnd: amount, matched: matchedText(text, match) }
    }
  }

  // ── Pattern 3: n.tr, ntr (e.g. 1.5tr, 2TR, 1tr5) ──
  // Word boundary after 'tr' prevents matching inside "triệu"
  const trCompactPattern = /(\d+)\s*tr\s*(\d)/i
  match = trCompactPattern.exec(lowerText)

  if (match) {
    const millions = parseInt(match[1]!, 10)
    const tenths = parseInt(match[2]!, 10)
    const amount = millions * 1_000_000 + tenths * 100_000

    if (amount >= 1000 && classifyIntent(text) === 'expense') {
      return { amountVnd: amount, matched: matchedText(text, match) }
    }
  }

  // Standard "n.tr" format with Unicode-aware boundary.
  // Plain \b fails for Vietnamese: "1 trường" matches because 'ư' is non-ASCII
  // (non-word char) so \b between 'r' and 'ư' is a boundary.
  const trPattern = /(\d+(?:\.\d+)?)\s*tr(?![\p{L}\p{N}])/iu
  match = trPattern.exec(lowerText)

  if (match) {
    const num = parseFloat(match[1]!)
    const amount = Math.round(num * 1_000_000)

    if (amount >= 1000 && classifyIntent(text) === 'expense') {
      return { amountVnd: amount, matched: matchedText(text, match) }
    }
  }

  // ── Pattern 4: n củ / n cụ / n cù (e.g. 1 củ = 1.000.000) ──
  // Hỗ trợ cả 3 dấu: ủ (hook above), ụ (dot below), ù (grave accent).
  // Unicode-aware boundary prevents matching "1 cứu" (rescue), "1 cuồng" etc.
  const cuPattern = /(\d+(?:\.\d+)?)\s*c[uùụủ](?![\p{L}\p{N}])/iu
  match = cuPattern.exec(lowerText)

  if (match) {
    const num = parseFloat(match[1]!)
    const amount = Math.round(num * 1_000_000)

    if (amount >= 1000 && classifyIntent(text) === 'expense') {
      return { amountVnd: amount, matched: matchedText(text, match) }
    }
  }

  // ── Pattern 5: n lít (e.g. 1 lít = 100.000) ──
  const litPattern = /(\d+(?:\.\d+)?)\s*lít/i
  match = litPattern.exec(lowerText)

  if (match) {
    const num = parseFloat(match[1]!)
    const amount = Math.round(num * 100_000)

    if (amount >= 1000 && classifyIntent(text) === 'expense') {
      return { amountVnd: amount, matched: matchedText(text, match) }
    }
  }

  // ── Pattern 6: n xị (e.g. 5 xị = 500.000) ──
  const xiPattern = /(\d+(?:\.\d+)?)\s*x[iị]/i
  match = xiPattern.exec(lowerText)

  if (match) {
    const num = parseFloat(match[1]!)
    const amount = Math.round(num * 100_000)

    if (amount >= 1000 && classifyIntent(text) === 'expense') {
      return { amountVnd: amount, matched: matchedText(text, match) }
    }
  }

  // ── Pattern 7: n nghìn / n ngàn / n ng (e.g. 20 nghìn = 20.000) ──
  const nghinPattern = /(\d+(?:\.\d+)?)\s*(nghìn|ngàn|ng)\b/i
  match = nghinPattern.exec(lowerText)

  if (match) {
    const num = parseFloat(match[1]!)
    const amount = Math.round(num * 1000)

    if (amount >= 1000 && classifyIntent(text) === 'expense') {
      return { amountVnd: amount, matched: matchedText(text, match) }
    }
  }

  // ── Pattern 8: Plain Vietnamese number (100.000 / 100000 / 1.000.000) ──
  const plainNumberPattern = /(\d{1,3}(?:\.\d{3})+|\d{4,})/
  match = plainNumberPattern.exec(text)

  if (match) {
    const stripped = stripThousandSeparators(match[1]!)

    if (isValidPlainNumber(stripped)) {
      const amount = parseInt(stripped, 10)

      if (classifyIntent(text) === 'expense') {
        return { amountVnd: amount, matched: match[0] }
      }
    }
  }

  // ── Pattern 9: Number ending with 000 (3 zeros) and >= 1000 ──
  const trailingZerosPattern = /\b(\d{1,9}000)\b/
  match = trailingZerosPattern.exec(text)

  if (match) {
    const n = parseInt(match[1]!, 10)

    if (n >= 1000 && n <= 999_999_999_999) {
      if (classifyIntent(text) === 'expense') {
        return { amountVnd: n, matched: match[0] }
      }
    }
  }

  return null
}

/**
 * Check if text looks like an expense (has amount + spending intent).
 *
 * Returns true when:
 * - detectAmountInVnd returns a result, OR
 * - text contains an amount pattern + a spending verb
 */
export const looksLikeExpense = (text: string): boolean => {
  const lowerText = text.toLowerCase()

  // Primary path: detector found a valid amount
  if (detectAmountInVnd(text) !== null) {
    return true
  }

  // Fallback: spending verb + any number
  const hasNumber = /\d+/.test(text)
  const hasSpendVerb = containsAnyWord(lowerText, SPEND_VERBS)

  if (hasNumber && hasSpendVerb) {
    // If income words also present → ambiguous → reject
    if (containsAnyWord(lowerText, INCOME_WORDS)) {
      return false
    }

    return true
  }

  return false
}
