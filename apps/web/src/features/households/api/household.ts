import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  CreateHouseholdRequest,
  DeleteHouseholdResponse,
  HouseholdDTO,
  LeaveHouseholdResponse,
  ListHouseholdMembersResponse,
  ListHouseholdsResponse,
  RemoveMemberResponse,
  UpdateHouseholdMemberRoleRequest,
  UpdateHouseholdMemberRoleResponse,
  UpdateHouseholdRequest,
} from '@/features/households/types/household'

export const createHousehold = async (payload: CreateHouseholdRequest) => {
  const response = await client.post<HouseholdDTO>(
    API_ENDPOINTS.households.list,
    payload,
  )

  return response.data
}

export const listHouseholds = async () => {
  const response = await client.get<ListHouseholdsResponse>(
    API_ENDPOINTS.households.list,
  )

  return response.data
}

export const getHousehold = async (householdId: string) => {
  const response = await client.get<HouseholdDTO>(
    API_ENDPOINTS.households.detail(householdId),
  )

  return response.data
}

export const updateHousehold = async (
  householdId: string,
  payload: UpdateHouseholdRequest,
) => {
  const response = await client.patch<HouseholdDTO>(
    API_ENDPOINTS.households.detail(householdId),
    payload,
  )

  return response.data
}

export const archiveHousehold = async (householdId: string) => {
  const response = await client.delete<DeleteHouseholdResponse>(
    API_ENDPOINTS.households.detail(householdId),
  )

  return response.data
}

export const getHouseholdMembers = async (householdId: string) => {
  const response = await client.get<ListHouseholdMembersResponse>(
    API_ENDPOINTS.households.members(householdId),
  )

  return response.data
}

export const removeHouseholdMember = async (
  householdId: string,
  userId: string,
) => {
  const response = await client.delete<RemoveMemberResponse>(
    API_ENDPOINTS.households.member(householdId, userId),
  )

  return response.data
}

export const leaveHousehold = async (householdId: string) => {
  const response = await client.delete<LeaveHouseholdResponse>(
    API_ENDPOINTS.households.leave(householdId),
  )

  return response.data
}

export const updateHouseholdMemberRole = async (
  householdId: string,
  userId: string,
  payload: UpdateHouseholdMemberRoleRequest,
) => {
  const response = await client.patch<UpdateHouseholdMemberRoleResponse>(
    API_ENDPOINTS.households.member(householdId, userId),
    payload,
  )

  return response.data
}
