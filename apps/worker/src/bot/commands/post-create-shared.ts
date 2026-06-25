/**
 * Shared helpers for the post-create handlers (feat-121).
 *
 * Currently holds a date formatter used by all three handlers when
 * rendering summary lines. Centralizing here avoids drift between the
 * picker / apply / delete paths and keeps the handler files focused on
 * their callback semantics.
 */

/**
 * Format a millisecond epoch as `YYYY-MM-DD` for the renderers. Mirrors
 * what the /ai preview path does, so the post-create summary line uses
 * the same date format the user saw during preview.
 */
export const formatDateOnly = (epochMs: number): string => {
  const d = new Date(epochMs)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}
