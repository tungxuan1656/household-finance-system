import type { ProfileResponse, UpdateProfileRequest } from '@/contracts'
import { updateUserProfile } from '@/db/repositories/user-repository'
import type { AppBindings } from '@/types'

export const updateCurrentProfile = async (
  env: AppBindings['Bindings'],
  userId: string,
  input: UpdateProfileRequest,
): Promise<ProfileResponse> => {
  const user = await updateUserProfile(env.DB, userId, {
    displayName: input.displayName,
    avatarUrl: input.avatarUrl,
  })

  return {
    id: user.id,
    email: user.primaryEmail,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }
}
