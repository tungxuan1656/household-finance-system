export type HouseholdRoleDTO = 'admin' | 'member'

export type DefaultVisibility = 'private' | 'household'

export type HouseholdDTO = {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  defaultVisibility: DefaultVisibility
  role: HouseholdRoleDTO
  createdAt: number
}

export type CreateHouseholdRequest = {
  name: string
  defaultCurrencyCode?: string
}

export type UpdateHouseholdRequest = {
  name?: string
  defaultCurrencyCode?: string
  timezone?: string
  defaultVisibility?: DefaultVisibility
}

export type ListHouseholdsResponse = {
  items: HouseholdDTO[]
}

export type DeleteHouseholdResponse = {
  archived: true
}

export type HouseholdMemberDTO = {
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  role: HouseholdRoleDTO
  joinedAt: number
}

export type ListHouseholdMembersResponse = {
  items: HouseholdMemberDTO[]
}

export type RemoveMemberResponse = {
  removed: true
}

export type LeaveHouseholdResponse = {
  left: true
}

export type UpdateHouseholdMemberRoleRequest = {
  role: HouseholdRoleDTO
}

export type UpdateHouseholdMemberRoleResponse = {
  updated: true
}
