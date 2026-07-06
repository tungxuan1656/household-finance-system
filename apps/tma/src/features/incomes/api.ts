import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { get, post } from '@/lib/api/client'
import { notification } from '@/lib/telegram/haptics'

import type {
  CreateIncomeRequest,
  IncomeDTO,
  IncomeListParams,
  IncomeListResponse,
} from './types'

const listIncomes = (params?: IncomeListParams) =>
  get<IncomeListResponse>('/incomes', { params })

const createIncome = (payload: CreateIncomeRequest) =>
  post<IncomeDTO>('/incomes', payload)

export const INCOME_KEYS = {
  all: ['incomes'] as const,
  infiniteList: (params?: IncomeListParams) =>
    [...INCOME_KEYS.all, 'infinite-list', params] as const,
}

const invalidateIncomeSurfaces = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await queryClient.invalidateQueries({ queryKey: INCOME_KEYS.all })
}

export const incomeListInfiniteQueryOptions = (params?: IncomeListParams) => ({
  queryKey: INCOME_KEYS.infiniteList(params),
  queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
    listIncomes({ ...params, cursor: pageParam }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage: IncomeListResponse) =>
    lastPage.nextCursor ?? undefined,
})

export const useIncomesInfiniteQuery = (params?: IncomeListParams) =>
  useInfiniteQuery(incomeListInfiniteQueryOptions(params))

export const useCreateIncomeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIncome,
    onSuccess: async () => {
      await invalidateIncomeSurfaces(queryClient)
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}
