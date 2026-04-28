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
