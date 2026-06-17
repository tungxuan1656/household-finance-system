import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { HOUSEHOLD_KEYS } from '@/features/households/api/households'
import { get, post } from '@/lib/api/client'
import { notification } from '@/lib/telegram/haptics'

import type {
  AcceptInvitationResponse,
  CreateInvitationRequest,
  InvitationCreateResponse,
  InvitationPreviewResponse,
} from '../types'

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

const createInvitation = (
  householdId: string,
  payload: CreateInvitationRequest,
) =>
  post<InvitationCreateResponse>(
    `/households/${householdId}/invitations`,
    payload,
  )

const getInvitationPreview = (token: string) =>
  get<InvitationPreviewResponse>(`/invitations/${token}`, {
    authenticated: false,
  })

const acceptInvitation = (token: string) =>
  post<AcceptInvitationResponse>(`/invitations/${token}/accept`)

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const INVITATION_KEYS = {
  all: ['invitations'] as const,
  preview: (token: string) =>
    [...INVITATION_KEYS.all, 'preview', token] as const,
}

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export const invitationPreviewQueryOptions = (token: string) =>
  queryOptions({
    queryKey: INVITATION_KEYS.preview(token),
    queryFn: () => getInvitationPreview(token),
  })

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export const useInvitationPreviewQuery = (token: string | undefined) =>
  useQuery({
    ...invitationPreviewQueryOptions(token ?? ''),
    enabled: Boolean(token),
  })

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export const useCreateInvitationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      householdId,
      payload,
    }: {
      householdId: string
      payload: CreateInvitationRequest
    }) => createInvitation(householdId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
    },
    onError: () => {
      notification('error')
    },
  })
}

export const useAcceptInvitationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOUSEHOLD_KEYS.all })
    },
    onError: () => {
      notification('error')
    },
  })
}
