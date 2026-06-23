/**
 * Render a visual progress bar string.
 * Uses full block ▓ for filled and light shade ░ for empty.
 * Width controls total character count (default 16).
 */
export const renderProgressBar = (
  percent: number,
  width: number = 16,
): string => {
  const clamped = Math.max(0, Math.min(100, percent))
  const filled = Math.round((clamped / 100) * width)
  const empty = width - filled

  return '▓'.repeat(filled) + '░'.repeat(empty)
}
