import type { ProfileResponse } from '@/contracts'
import { loadUserById } from '@/db/repositories/user-repository'
import type { SupportedLocale } from '@/lib/i18n'
import type { AppBindings } from '@/types'

export const getCurrentProfile = async (
  env: AppBindings['Bindings'],
  userId: string,
  locale: SupportedLocale,
): Promise<ProfileResponse> => {
  const user = await loadUserById(env.DB, userId, locale)

  return {
    id: user.id,
    email: user.primaryEmail,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }
}
