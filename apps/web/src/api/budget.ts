import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  BudgetDTO,
  CreateBudgetRequest,
  DeleteBudgetResponse,
  GetBudgetStatusResponse,
  ListBudgetsParams,
  ListBudgetsResponse,
  UpdateBudgetMutationInput,
} from '@/features/budgets/types/budget'

export const createBudget = async (payload: CreateBudgetRequest) => {
  const response = await client.post<BudgetDTO>(
    API_ENDPOINTS.budgets.create,
    payload,
  )

  return response.data
}

export const listBudgets = async (params: ListBudgetsParams = {}) => {
  const query: Record<string, string> = {}
  if (params.householdId) {
    query.household_id = params.householdId
  }
  if (params.scope) {
    query.scope = params.scope
  }
  if (params.period) {
    query.period = params.period
  }

  const response = await client.get<ListBudgetsResponse>(
    API_ENDPOINTS.budgets.list,
    { params: query },
  )

  return response.data
}

export const getBudget = async (id: string) => {
  const response = await client.get<BudgetDTO>(API_ENDPOINTS.budgets.detail(id))

  return response.data
}

export const getBudgetStatus = async (id: string) => {
  const response = await client.get<GetBudgetStatusResponse>(
    API_ENDPOINTS.budgets.status(id),
  )

  return response.data
}

export const deleteBudget = async (id: string) => {
  const response = await client.delete<DeleteBudgetResponse>(
    API_ENDPOINTS.budgets.detail(id),
  )

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
