import { useQuery } from '@tanstack/react-query'

import {
  getReferenceCategories,
  getReferenceSources,
} from '@/api/reference-data'

export const REFERENCE_DATA_KEYS = {
  all: ['reference-data'] as const,
  categories: () => [...REFERENCE_DATA_KEYS.all, 'categories'] as const,
  sources: () => [...REFERENCE_DATA_KEYS.all, 'sources'] as const,
}

export const useReferenceCategoriesQuery = () =>
  useQuery({
    queryKey: REFERENCE_DATA_KEYS.categories(),
    queryFn: getReferenceCategories,
  })

export const useReferenceSourcesQuery = () =>
  useQuery({
    queryKey: REFERENCE_DATA_KEYS.sources(),
    queryFn: getReferenceSources,
  })
