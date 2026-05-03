import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { ExpenseDTO } from '@/types/expense'
import type {
  ArchiveExpenseGroupResponse,
  CreateExpenseGroupRequest,
  ExpenseGroupDTO,
  GroupSummaryDTO,
  ListExpenseGroupsResponse,
  ReplaceExpenseGroupsRequest,
  UpdateExpenseGroupMutationInput,
} from '@/types/group'

export const createExpenseGroup = async (
  payload: CreateExpenseGroupRequest,
) => {
  const response = await client.post<ExpenseGroupDTO>(
    API_ENDPOINTS.groups.create,
    payload,
  )

  return response.data
}

export const listExpenseGroups = async (householdId: string) => {
  const response = await client.get<ListExpenseGroupsResponse>(
    API_ENDPOINTS.groups.list,
    {
      params: { household_id: householdId },
    },
  )

  return response.data
}

export const getExpenseGroup = async (id: string) => {
  const response = await client.get<ExpenseGroupDTO>(
    API_ENDPOINTS.groups.detail(id),
  )

  return response.data
}

export const updateExpenseGroup = async ({
  id,
  payload,
}: UpdateExpenseGroupMutationInput) => {
  const response = await client.patch<ExpenseGroupDTO>(
    API_ENDPOINTS.groups.detail(id),
    payload,
  )

  return response.data
}

export const archiveExpenseGroup = async (id: string) => {
  const response = await client.post<ArchiveExpenseGroupResponse>(
    API_ENDPOINTS.groups.archive(id),
  )

  return response.data
}

export const getGroupSummary = async (id: string) => {
  const response = await client.get<GroupSummaryDTO>(
    API_ENDPOINTS.groups.summary(id),
  )

  return response.data
}

export const replaceExpenseGroups = async (
  expenseId: string,
  payload: ReplaceExpenseGroupsRequest,
) => {
  const response = await client.patch<ExpenseDTO>(
    API_ENDPOINTS.expenses.replaceGroups(expenseId),
    payload,
  )

  return response.data
}
