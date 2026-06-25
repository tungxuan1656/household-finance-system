/**
 * Escape user-provided text for safe insertion into Telegram HTML messages.
 * Telegram HTML parse_mode interprets these chars; escape them.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Build a visual progress bar. Default width 10 (narrower than old 16).
 * Uses full block ▓ for filled and light shade ░ for empty.
 */
export function buildProgressBar(percent: number, width: number = 10): string {
  const clamped = Math.max(0, Math.min(100, percent))
  const filled = Math.round((clamped / 100) * width)
  const empty = width - filled

  return '▓'.repeat(filled) + '░'.repeat(empty)
}
