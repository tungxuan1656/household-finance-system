export type HouseholdRoleDTO = 'admin' | 'member'

export type HouseholdDTO = {
  id: string
  name: string
  slug: string
  defaultCurrencyCode: string
  timezone: string
  role: HouseholdRoleDTO
  createdAt: number
}

export type CreateHouseholdRequest = {
  name: string
  defaultCurrencyCode: string
}

export type ListHouseholdsResponse = {
  items: HouseholdDTO[]
}
