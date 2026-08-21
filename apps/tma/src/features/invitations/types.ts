export type InvitationRoleDTO = 'admin' | 'member'
export type InvitationTtlHours = 24 | 72 | 168

export type CreateInvitationRequest = {
  role: InvitationRoleDTO
  ttlHours: InvitationTtlHours
}

export type InvitationCreateResponse = {
  invitationId: string
  invitedRole: InvitationRoleDTO
  expiresAt: number
  invitePath: string
  token: string
}

export type InvitationPreviewResponse = {
  household: {
    id: string
    name: string
  }
  invitedRole: InvitationRoleDTO
  expiresAt: number
}

export type AcceptInvitationResponse = {
  householdId: string
  role: InvitationRoleDTO
}
