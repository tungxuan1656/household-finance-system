export const API_BASE_PATH = '/api/v1'

export const API_ENDPOINTS = {
  auth: {
    logout: '/auth/logout',
    exchange: '/auth/provider/exchange',
    providerExchange: '/auth/provider/exchange',
    refresh: '/auth/refresh',
  },
  health: '/health',
  profile: '/profile',
  protected: {
    ping: '/protected/ping',
  },
} as const
