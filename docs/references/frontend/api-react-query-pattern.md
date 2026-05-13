# API + React Query Pattern

Use API files for HTTP. Use hooks for cache/state. UI calls hooks only.

## Structure

```text
apps/web/src/
  api/
    client.ts
    endpoints.ts
    <domain>.ts
    <domain>.mock.ts
  hooks/api/
    use-<domain>.ts
```

## Hard Rules

- Declare URLs in `API_ENDPOINTS`.
- Put HTTP calls in `api/<domain>.ts`.
- Put query keys + hooks in `hooks/api/use-<domain>.ts`.
- UI imports hooks, not `api/*`.
- Query keys come from `*_KEYS`; no inline key arrays in components.
- Mutations invalidate exact affected scope.
- `select` only transforms data. Never `select: (data) => data`.
- Check existing query/store data before adding new query.
- Mocks live in `api/<domain>.mock.ts`; never inline in components/hooks.

## API Module Shape

```ts
// apps/web/src/api/expenses.ts
import type { ApiResponse, CreateExpenseRequest, ExpenseDTO } from '@/types/api'

import { client } from './client'
import { API_ENDPOINTS } from './endpoints'

export const getExpenses = async (): Promise<ApiResponse<ExpenseDTO[]>> => {
  const response = await client.get<ApiResponse<ExpenseDTO[]>>(
    API_ENDPOINTS.expenses.list,
  )
  return response.data
}

export const createExpense = async (
  payload: CreateExpenseRequest,
): Promise<ApiResponse<ExpenseDTO>> => {
  const response = await client.post<ApiResponse<ExpenseDTO>>(
    API_ENDPOINTS.expenses.list,
    payload,
  )
  return response.data
}
```

## Hook Module Shape

```ts
// apps/web/src/hooks/api/use-expenses.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createExpense, getExpenses } from '@/api/expenses'

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  list: (params?: unknown) => [...EXPENSE_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...EXPENSE_KEYS.all, 'detail', id] as const,
}

export const useExpenses = (params?: unknown) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.list(params),
    queryFn: getExpenses,
    select: (res) => res.data,
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all })
    },
  })
}
```

## Infinite Query

```ts
useInfiniteQuery({
  queryKey: EXPENSE_KEYS.list(params),
  queryFn: ({ pageParam }) => getExpenses({ ...params, cursor: pageParam }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.data?.pagination.nextCursor,
})
```

## Mock Rule

```ts
// apps/web/src/api/expenses.mock.ts
import type { ExpenseDTO } from '@/types/api'

export const MOCK_EXPENSES: ExpenseDTO[] = []
```

Use mock only while backend contract is missing. Add remove-mock follow-up.

## Checklist

- [ ] Endpoint in `API_ENDPOINTS`
- [ ] Typed API function in `api/<domain>.ts`
- [ ] `*_KEYS` in hook file
- [ ] `useQuery` / `useMutation` wraps API function
- [ ] Mutation invalidates correct key
- [ ] UI imports hook only
- [ ] Mock, if any, lives in `api/<domain>.mock.ts`
