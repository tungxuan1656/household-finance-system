import type { SourceKey } from '@/types/reference-data'

export type CurrentUserProfileDTO = {
  avatarUrl: string | null
  createdAt: number
  displayName: string | null
  email: string | null
  id: string
  quickAddLastSourceKey: SourceKey | null
}

export type UpdateCurrentUserProfileRequest = {
  avatarUrl?: string | null
  displayName?: string | null
  quickAddLastSourceKey?: SourceKey | null
}
