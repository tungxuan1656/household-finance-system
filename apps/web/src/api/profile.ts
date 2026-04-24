import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  CurrentUserProfileDTO,
  UpdateCurrentUserProfileRequest,
} from '@/types/profile'

export const getCurrentUserProfile = () =>
  client.get<CurrentUserProfileDTO>(API_ENDPOINTS.profile)

export const updateCurrentUserProfile = (
  payload: UpdateCurrentUserProfileRequest,
) => client.patch<CurrentUserProfileDTO>(API_ENDPOINTS.profile, payload)
