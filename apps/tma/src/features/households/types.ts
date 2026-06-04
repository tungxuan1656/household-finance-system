import type {
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
  BudgetDTO,
  ExpenseDTO,
  ExpenseListParams,
  ExpenseListResponse,
  HouseholdMemberDTO,
  HouseholdRoleDTO,
  ListBudgetsResponse,
  ListHouseholdMembersResponse,
  ListReferenceCategoriesResponse,
  ReferenceCategoryDTO,
} from '@/features/home/types'

export type {
  AnalyticsOverviewDTO,
  AnalyticsOverviewParams,
  BudgetDTO,
  ExpenseDTO,
  ExpenseListParams,
  ExpenseListResponse,
  HouseholdMemberDTO,
  HouseholdRoleDTO,
  ListBudgetsResponse,
  ListHouseholdMembersResponse,
  ListReferenceCategoriesResponse,
  ReferenceCategoryDTO,
}

export type HouseholdDTO = {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  defaultCurrencyCode: string
  timezone: string
  role: HouseholdRoleDTO
  createdAt: number
}

export type ListHouseholdsResponse = {
  items: HouseholdDTO[]
}

export type CreateHouseholdRequest = {
  name: string
  defaultCurrencyCode?: string
}

export type UpdateHouseholdRequest = {
  name?: string
  defaultCurrencyCode?: string
  timezone?: string
  avatarUrl?: string | null
}

export type DeleteHouseholdResponse = {
  archived: true
}

export type LeaveHouseholdResponse = {
  left: true
}

export type RemoveMemberResponse = {
  removed: true
}

export type UpdateHouseholdMemberRoleRequest = {
  role: HouseholdRoleDTO
}

export type UpdateHouseholdMemberRoleResponse = {
  updated: true
}
