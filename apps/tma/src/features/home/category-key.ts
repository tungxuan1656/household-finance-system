import { CATEGORY_KEYS, type CategoryKey } from './types'

const VALID_CATEGORY_KEYS = new Set<string>(CATEGORY_KEYS)

/**
 * Safely narrow a raw string to a canonical CategoryKey.
 * Non-canonical/falsy values return `undefined`, which consumers
 * (e.g. `useCategoryPresentation`) already handle by falling back
 * to the `other` category.
 */
export const normalizeCategoryKey = (
  key: string | undefined,
): CategoryKey | undefined =>
  key && VALID_CATEGORY_KEYS.has(key) ? (key as CategoryKey) : undefined
