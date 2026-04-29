import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  ListReferenceCategoriesResponse,
  ListReferenceSourcesResponse,
} from '@/types/reference-data'

export const getReferenceCategories = async () => {
  const response = await client.get<ListReferenceCategoriesResponse>(
    API_ENDPOINTS.referenceData.categories,
    {
      skipAuth: true,
    },
  )

  return response.data
}

export const getReferenceSources = async () => {
  const response = await client.get<ListReferenceSourcesResponse>(
    API_ENDPOINTS.referenceData.sources,
    {
      skipAuth: true,
    },
  )

  return response.data
}
