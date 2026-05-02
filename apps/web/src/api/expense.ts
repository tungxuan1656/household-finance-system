import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { CreateExpenseRequest, ExpenseDTO } from '@/types/expense'

export const createExpense = async (payload: CreateExpenseRequest) => {
  const response = await client.post<ExpenseDTO>(
    API_ENDPOINTS.expenses.create,
    payload,
  )

  return response.data
}
