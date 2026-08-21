/**
 * Barrel re-export for expense parser — keeps public API unchanged
 * while implementation lives in expense-prompt, expense-coerce, expense-client.
 */
export type {
  AiParserConfig,
  ParseExpensesWithAiOptions,
  RawAiItem,
} from './expense-client'
export { AiUpstreamError, parseExpensesWithAi } from './expense-client'
export type { AiContext } from './expense-prompt'
export { AI_CONTEXT_MAX_ITEMS, buildSystemPrompt } from './expense-prompt'
