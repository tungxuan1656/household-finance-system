import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  BudgetDTO,
  CreateBudgetRequest,
  ListBudgetsResponse,
  UpdateBudgetMutationInput,
} from '@/types/budget'

export const createBudget = async (payload: CreateBudgetRequest) => {
  const response = await client.post<BudgetDTO>(
    API_ENDPOINTS.budgets.create,
    payload,
  )

  return response.data
}

export const listBudgets = async (householdId: string, period?: string) => {
  const params: Record<string, string> = { household_id: householdId }
  if (period) {
    params.period = period
  }

  const response = await client.get<ListBudgetsResponse>(
    API_ENDPOINTS.budgets.list,
    { params },
  )

  return response.data
}

export const getBudget = async (id: string) => {
  const response = await client.get<BudgetDTO>(API_ENDPOINTS.budgets.detail(id))

  return response.data
}

export const updateBudget = async ({
  id,
  payload,
}: UpdateBudgetMutationInput) => {
  const response = await client.patch<BudgetDTO>(
    API_ENDPOINTS.budgets.detail(id),
    payload,
  )

  return response.data
}
