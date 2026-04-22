import type { LogoutSessionResponse } from '@/contracts'
import { revokeSessionIfActive } from '@/db/repositories/session-repository'
import { unauthenticated } from '@/lib/errors'
import type { AppBindings, LogoutSessionInput } from '@/types'

export const logoutSession = async (
  env: AppBindings['Bindings'],
  input: LogoutSessionInput,
): Promise<LogoutSessionResponse> => {
  const revoked = await revokeSessionIfActive(env.DB, input.currentSessionId)

  if (!revoked) {
    throw unauthenticated(input.locale, 'errors.sessionExpiredOrRevoked')
  }

  return {
    revoked: true,
  }
}
