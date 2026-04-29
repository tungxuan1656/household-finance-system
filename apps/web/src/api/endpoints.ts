export const API_BASE_PATH: string =
  process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1'

export const API_ENDPOINTS = {
  auth: {
    logout: '/auth/logout',
    exchange: '/auth/provider/exchange',
    providerExchange: '/auth/provider/exchange',
    refresh: '/auth/refresh',
  },
  health: '/health',
  households: {
    detail: (householdId: string) => `/households/${householdId}`,
    invitations: (householdId: string) =>
      `/households/${householdId}/invitations`,
    list: '/households',
    members: (householdId: string) => `/households/${householdId}/members`,
    member: (householdId: string, userId: string) =>
      `/households/${householdId}/members/${userId}`,
    leave: (householdId: string) => `/households/${householdId}/members/me`,
  },
  invitations: {
    accept: (token: string) => `/invitations/${token}/accept`,
    preview: (token: string) => `/invitations/${token}`,
  },
  media: {
    uploadSignature: '/media/upload-signature',
  },
  referenceData: {
    categories: '/categories',
    sources: '/sources',
  },
  profile: '/users/me',
  protected: {
    ping: '/protected/ping',
  },
} as const
