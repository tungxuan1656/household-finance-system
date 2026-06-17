import { queryOptions, useQuery } from '@tanstack/react-query'

import { get } from '@/lib/api/client'

import type { ListReferenceCategoriesResponse } from '../types'

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

const getReferenceCategories = () =>
  get<ListReferenceCategoriesResponse>('/categories', {
    authenticated: false,
  })

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const REFERENCE_DATA_KEYS = {
  all: ['reference-data'] as const,
  categories: () => [...REFERENCE_DATA_KEYS.all, 'categories'] as const,
}

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export const referenceCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: REFERENCE_DATA_KEYS.categories(),
    queryFn: getReferenceCategories,
  })

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export const useReferenceCategoriesQuery = () =>
  useQuery(referenceCategoriesQueryOptions())
