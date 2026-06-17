import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { deleteRequest, get, patch, post } from '@/lib/api/client'
import { notification } from '@/lib/telegram/haptics'

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
} from '../types'
import { ANALYTICS_KEYS } from './analytics'
import { BUDGET_KEYS } from './budgets'
import { EXPENSE_KEYS } from './expenses'

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

const getHousehold = (householdId: string) =>
  get<HouseholdDTO>(`/households/${householdId}`)

const listHouseholds = () => get<ListHouseholdsResponse>('/households')

const createHousehold = (payload: CreateHouseholdRequest) =>
  post<HouseholdDTO>('/households', payload)

const updateHousehold = (
  householdId: string,
  payload: UpdateHouseholdRequest,
) => patch<HouseholdDTO>(`/households/${householdId}`, payload)

const archiveHousehold = (householdId: string) =>
  deleteRequest<DeleteHouseholdResponse>(`/households/${householdId}`)

const leaveHousehold = (householdId: string) =>
  deleteRequest<LeaveHouseholdResponse>(`/households/${householdId}/members/me`)

const getHouseholdMembers = (householdId: string) =>
  get<ListHouseholdMembersResponse>(`/households/${householdId}/members`)

const removeHouseholdMember = (householdId: string, userId: string) =>
  deleteRequest<RemoveMemberResponse>(
    `/households/${householdId}/members/${userId}`,
  )

const updateHouseholdMemberRole = (
  householdId: string,
  userId: string,
  payload: UpdateHouseholdMemberRoleRequest,
) =>
  patch<UpdateHouseholdMemberRoleResponse>(
    `/households/${householdId}/members/${userId}`,
    payload,
  )

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const HOUSEHOLD_KEYS = {
  all: ['households'] as const,
  list: () => [...HOUSEHOLD_KEYS.all, 'list'] as const,
  detail: (householdId: string) =>
    [...HOUSEHOLD_KEYS.all, 'detail', householdId] as const,
  members: (householdId: string) =>
    [...HOUSEHOLD_KEYS.all, 'members', householdId] as const,
}

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export const householdListQueryOptions = () =>
  queryOptions({
    queryKey: HOUSEHOLD_KEYS.list(),
    queryFn: listHouseholds,
  })

export const householdDetailQueryOptions = (householdId: string) =>
  queryOptions({
    queryKey: HOUSEHOLD_KEYS.detail(householdId),
    queryFn: () => getHousehold(householdId),
  })

export const householdMembersQueryOptions = (householdId: string) =>
  queryOptions({
    queryKey: HOUSEHOLD_KEYS.members(householdId),
    queryFn: () => getHouseholdMembers(householdId),
  })

// ---------------------------------------------------------------------------
// Query hooks (single)
// ---------------------------------------------------------------------------

export const useHouseholdListQuery = () => useQuery(householdListQueryOptions())

export const useHouseholdDetailQuery = (householdId: string | undefined) =>
  useQuery({
    ...householdDetailQueryOptions(householdId ?? 'unknown'),
    enabled: Boolean(householdId),
  })

export const useHouseholdMembersQuery = (householdId: string | undefined) =>
  useQuery({
    ...householdMembersQueryOptions(householdId ?? 'unknown'),
    enabled: Boolean(householdId),
  })

// ---------------------------------------------------------------------------
// Mutation helpers & hooks
// ---------------------------------------------------------------------------

export const invalidateHouseholdSurfaceQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all }),
  ])
}

export const useCreateHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createHousehold,
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}

export const useUpdateHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      householdId,
      payload,
    }: {
      householdId: string
      payload: UpdateHouseholdRequest
    }) => updateHousehold(householdId, payload),
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}

export const useArchiveHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: archiveHousehold,
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}

export const useLeaveHouseholdMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leaveHousehold,
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}

export const useRemoveHouseholdMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      householdId,
      userId,
    }: {
      householdId: string
      userId: string
    }) => removeHouseholdMember(householdId, userId),
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}

export const useUpdateHouseholdMemberRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      householdId,
      payload,
      userId,
    }: {
      householdId: string
      payload: UpdateHouseholdMemberRoleRequest
      userId: string
    }) => updateHouseholdMemberRole(householdId, userId, payload),
    onSuccess: async () => {
      await invalidateHouseholdSurfaceQueries(queryClient)
    },
    onError: (error) => {
      console.error(error)
      notification('error')
    },
  })
}

// ---------------------------------------------------------------------------
// Combined query hooks (parallel queries)
// ---------------------------------------------------------------------------

export const useHouseholdMemberQueries = (households: HouseholdDTO[]) =>
  useQueries({
    queries: households.map((household) =>
      householdMembersQueryOptions(household.id),
    ),
  })
