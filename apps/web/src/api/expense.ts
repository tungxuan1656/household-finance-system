import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  CreateExpenseRequest,
  ExpenseDTO,
  ExpenseListParams,
  ExpenseListResponse,
} from '@/types/expense'

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

export const getExpenseDetail = async (id: string) => {
  const response = await client.get<ExpenseDTO>(
    API_ENDPOINTS.expenses.detail(id),
  )

  return response.data
}
