import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  CreateHouseholdRequest,
  HouseholdDTO,
  ListHouseholdsResponse,
} from '@/types/household'

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
