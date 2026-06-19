// Re-export canonical reference-data query options from the home feature.
// This module existed as a duplicate before consolidation.
// All public exports are preserved so existing import paths still compile.
export {
  REFERENCE_DATA_KEYS,
  referenceCategoriesQueryOptions,
  useReferenceCategoriesQuery,
} from '@/features/home/api'
