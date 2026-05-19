import { client } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  AcceptInvitationResponse,
  CreateInvitationRequest,
  InvitationCreateResponse,
  InvitationPreviewResponse,
} from '@/features/invitations/types/invitation'

export const createInvitation = async (
  householdId: string,
  payload: CreateInvitationRequest,
) => {
  const response = await client.post<InvitationCreateResponse>(
    API_ENDPOINTS.households.invitations(householdId),
    payload,
  )

  return response.data
}

export const getInvitationPreview = async (token: string) => {
  const response = await client.get<InvitationPreviewResponse>(
    API_ENDPOINTS.invitations.preview(token),
    { skipAuth: true },
  )

  return response.data
}

export const acceptInvitation = async (token: string) => {
  const response = await client.post<AcceptInvitationResponse>(
    API_ENDPOINTS.invitations.accept(token),
    {},
  )

  return response.data
}
