const EXACT_ALLOWED_CORS_ORIGINS = new Set(['http://100.116.7.43:3000'])
const LOOPBACK_HOSTNAMES = new Set(['127.0.0.1', '::1', 'localhost'])

const normalizeHostname = (hostname: string) =>
  hostname.replace(/^\[/, '').replace(/\]$/, '')

export const isAllowedCorsOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin)

    if (url.protocol !== 'http:') {
      return false
    }

    return (
      EXACT_ALLOWED_CORS_ORIGINS.has(origin) ||
      LOOPBACK_HOSTNAMES.has(normalizeHostname(url.hostname))
    )
  } catch {
    return false
  }
}

export const resolveCorsOrigin = (origin?: string | null) => {
  if (!origin) {
    return ''
  }

  return isAllowedCorsOrigin(origin) ? origin : ''
}
