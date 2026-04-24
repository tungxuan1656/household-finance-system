import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { getCurrentUserProfile, updateCurrentUserProfile } from '@/api/profile'
import { authActions } from '@/stores/auth.store'
import type {
  CurrentUserProfileDTO,
  UpdateCurrentUserProfileRequest,
} from '@/types/profile'

export const PROFILE_KEYS = {
  all: ['profile'] as const,
  detail: () => [...PROFILE_KEYS.all, 'me'] as const,
}

const applyOptimisticUpdate = (
  queryClient: QueryClient,
  patch: UpdateCurrentUserProfileRequest,
) => {
  const key = PROFILE_KEYS.detail()
  const previousProfile = queryClient.getQueryData<CurrentUserProfileDTO>(key)

  if (previousProfile) {
    queryClient.setQueryData<CurrentUserProfileDTO>(key, {
      ...previousProfile,
      avatarUrl:
        patch.avatarUrl !== undefined
          ? patch.avatarUrl
          : previousProfile.avatarUrl,
      displayName:
        patch.displayName !== undefined
          ? patch.displayName
          : previousProfile.displayName,
    })
  }

  return previousProfile
}

export const useCurrentUserProfileQuery = () =>
  useQuery({
    queryKey: PROFILE_KEYS.detail(),
    queryFn: getCurrentUserProfile,
  })

export const useUpdateCurrentUserProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCurrentUserProfileRequest) =>
      updateCurrentUserProfile(payload),
    onError: (_error, _payload, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_KEYS.detail(), context.previousProfile)
      }
    },
    onMutate: async (payload: UpdateCurrentUserProfileRequest) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_KEYS.detail() })

      const previousProfile = applyOptimisticUpdate(queryClient, payload)

      return {
        previousProfile,
      }
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(PROFILE_KEYS.detail(), profile)

      authActions.updateUserProfile({
        avatarUrl: profile.avatarUrl,
        displayName: profile.displayName,
      })
    },
  })
}
