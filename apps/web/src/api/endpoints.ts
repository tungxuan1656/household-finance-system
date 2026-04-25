export const API_BASE_PATH: string =
  import.meta.env.VITE_API_BASE_URL || '/api/v1'

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
    list: '/households',
  },
  media: {
    uploadSignature: '/media/upload-signature',
  },
  profile: '/users/me',
  protected: {
    ping: '/protected/ping',
  },
} as const
