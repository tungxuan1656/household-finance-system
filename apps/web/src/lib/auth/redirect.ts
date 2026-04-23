import {
  AUTH_DEFAULT_REDIRECT_PATH,
  AUTH_ONBOARDING_REDIRECT_PATH,
} from '@/lib/constants/auth'

const isSafeInternalPath = (
  value: string | null | undefined,
): value is string =>
  typeof value === 'string' &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.includes('://')

export const resolveAuthRedirect = (input: {
  fallback?: string
  postAuthRedirect?: string | null
  returnTo?: string | null
}) => {
  if (isSafeInternalPath(input.postAuthRedirect)) {
    return input.postAuthRedirect
  }

  if (isSafeInternalPath(input.returnTo)) {
    return input.returnTo
  }

  return input.fallback ?? AUTH_DEFAULT_REDIRECT_PATH
}

export const resolveOnboardingRedirect = (returnTo?: string | null) =>
  resolveAuthRedirect({
    fallback: AUTH_ONBOARDING_REDIRECT_PATH,
    postAuthRedirect: AUTH_ONBOARDING_REDIRECT_PATH,
    returnTo,
  })
