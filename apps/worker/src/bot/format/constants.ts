export const LOADER_TEXT = '⏳ Phân tích...'
export const AI_UNAVAILABLE_TEXT = 'AI tạm không khả dụng. Thử lại sau.'
export const INPUT_UNRECOGNIZED_TEXT = 'Không nhận diện được. Thử lại.'

/**
 * Build an "unrecognized command" error message with an example.
 * The example is wrapped in `<code>` tags.
 */
export function unrecognizedCommandText(example: string): string {
  return `Không nhận diện được. Thử lại.\n\nVd: <code>${example}</code>`
}

/**
 * Build a "missing fields" error message with an example.
 * The example is wrapped in `<code>` tags.
 */
export function missingFieldsText(example: string): string {
  return `Thiếu thông tin. Thử lại.\n\nVd: <code>${example}</code>`
}
