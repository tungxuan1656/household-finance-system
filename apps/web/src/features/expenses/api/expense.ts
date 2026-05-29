import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { ReplaceExpenseGroupsRequest } from '@/features/groups/types/group'

import type {
  CreateExpenseRequest,
  DeleteExpenseResponse,
  ExpenseDTO,
  ExpenseListParams,
  ExpenseListResponse,
  ExpenseSummaryResponse,
  RestoreExpenseResponse,
  UpdateExpenseMutationInput,
  UpdateExpenseResponse,
} from '../types/expense'

export const createExpense = async (payload: CreateExpenseRequest) => {
  const response = await client.post<ExpenseDTO>(
    API_ENDPOINTS.expenses.create,
    payload,
  )

  return response.data
}

export const listExpenses = async (params?: ExpenseListParams) => {
  const response = await client.get<ExpenseListResponse>(
    API_ENDPOINTS.expenses.list,
    { params },
  )

  return response.data
}

export const getExpenseSummary = async (params?: ExpenseListParams) => {
  const response = await client.get<ExpenseSummaryResponse>(
    API_ENDPOINTS.expenses.summary,
    { params },
  )

  return response.data
}

export const getExpenseDetail = async (id: string) => {
  const response = await client.get<ExpenseDTO>(
    API_ENDPOINTS.expenses.detail(id),
  )

  return response.data
}

export const updateExpense = async ({
  id,
  payload,
}: UpdateExpenseMutationInput) => {
  const response = await client.patch<UpdateExpenseResponse>(
    API_ENDPOINTS.expenses.detail(id),
    payload,
  )

  return response.data
}

export const deleteExpense = async (id: string) => {
  const response = await client.delete<DeleteExpenseResponse>(
    API_ENDPOINTS.expenses.detail(id),
  )

  return response.data
}

export const restoreExpense = async (id: string) => {
  const response = await client.post<RestoreExpenseResponse>(
    API_ENDPOINTS.expenses.restore(id),
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
