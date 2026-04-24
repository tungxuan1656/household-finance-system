export type CurrentUserProfileDTO = {
  avatarUrl: string | null
  createdAt: number
  displayName: string | null
  email: string | null
  id: string
}

export type UpdateCurrentUserProfileRequest = {
  avatarUrl?: string | null
  displayName?: string | null
}
