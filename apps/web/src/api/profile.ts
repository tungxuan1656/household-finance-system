import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  CurrentUserProfileDTO,
  UpdateCurrentUserProfileRequest,
} from '@/types/profile'

export const getCurrentUserProfile = async () => {
  const response = await client.get<CurrentUserProfileDTO>(
    API_ENDPOINTS.profile,
  )

  return response.data
}

export const updateCurrentUserProfile = async (
  payload: UpdateCurrentUserProfileRequest,
) => {
  const response = await client.patch<CurrentUserProfileDTO>(
    API_ENDPOINTS.profile,
    payload,
  )

  return response.data
}
