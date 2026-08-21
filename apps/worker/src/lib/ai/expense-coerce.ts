/**
 * Safely coerce an AI-provided amount to a number.
 *
 * - Numbers pass through.
 * - Numeric strings ("50000") are converted.
 * - NaN, Infinity, negative values are returned as undefined
 *   so the handler schema (positive()) can reject them cleanly.
 */
export const coerceAmount = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length === 0) return undefined

    const n = Number(trimmed)

    return Number.isFinite(n) && n > 0 ? n : undefined
  }

  return undefined
}
