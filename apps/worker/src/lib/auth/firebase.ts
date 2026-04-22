import { createRemoteJWKSet, type JWTPayload, jwtVerify } from 'jose'

import { unauthenticated } from '@/lib/errors'
import type { AppConfig } from '@/types'

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

interface FirebaseIdentity {
  sub: string
  email: string | null
  emailVerified: boolean
  name: string | null
  picture: string | null
}

const getJwks = (url: string): ReturnType<typeof createRemoteJWKSet> => {
  const cached = jwksCache.get(url)

  if (cached) {
    return cached
  }

  const jwks = createRemoteJWKSet(new URL(url))
  jwksCache.set(url, jwks)

  return jwks
}

const parseUnsafeTestToken = (idToken: string): FirebaseIdentity | null => {
  if (!idToken.startsWith('test:')) {
    return null
  }

  const tokenPayload = idToken.slice('test:'.length)
  const firstSeparator = tokenPayload.indexOf(':')
  const sub =
    firstSeparator === -1 ? tokenPayload : tokenPayload.slice(0, firstSeparator)

  const secondSeparator = tokenPayload.indexOf(':', firstSeparator + 1)
  const thirdSeparator =
    secondSeparator === -1 ? -1 : tokenPayload.indexOf(':', secondSeparator + 1)
  const email =
    firstSeparator === -1
      ? null
      : secondSeparator === -1
        ? tokenPayload.slice(firstSeparator + 1) || null
        : tokenPayload.slice(firstSeparator + 1, secondSeparator) || null
  const name =
    secondSeparator === -1 || thirdSeparator === -1
      ? null
      : tokenPayload.slice(secondSeparator + 1, thirdSeparator) || null
  const picture =
    thirdSeparator === -1
      ? null
      : tokenPayload.slice(thirdSeparator + 1) || null

  if (!sub || sub.length === 0) {
    return null
  }

  return {
    sub,
    email: email ?? null,
    emailVerified: true,
    name: name ?? null,
    picture: picture ?? null,
  }
}

const normalizeFirebasePayload = (payload: JWTPayload): FirebaseIdentity => {
  if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw unauthenticated('Firebase token is missing subject.')
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : null,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === 'string' ? payload.name : null,
    picture: typeof payload.picture === 'string' ? payload.picture : null,
  }
}

export const verifyFirebaseIdToken = async (
  idToken: string,
  config: AppConfig,
): Promise<FirebaseIdentity> => {
  if (config.allowInsecureTestTokens) {
    const parsed = parseUnsafeTestToken(idToken)

    if (parsed) {
      return parsed
    }
  }

  const issuer = `https://securetoken.google.com/${config.firebaseProjectId}`

  let verificationResult

  try {
    verificationResult = await jwtVerify(
      idToken,
      getJwks(config.firebaseJwksUrl),
      {
        issuer,
        audience: config.firebaseProjectId,
        algorithms: ['RS256'],
      },
    )
  } catch {
    throw unauthenticated('Invalid Firebase identity token.')
  }

  return normalizeFirebasePayload(verificationResult.payload)
}
