import { SELF, env } from 'cloudflare:test'

import {
  type ApiEnvelope,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

export { SELF, env, parseJson }
export type { ApiEnvelope }

export const exchangeProfileToken = async (idToken: string) => {
  const response = await SELF.fetch(
    'https://example.com/api/v1/auth/provider/exchange',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'firebase',
        idToken,
      }),
    },
  )

  return {
    response,
    payload:
      await parseJson<
        ApiEnvelope<{ accessToken: string; user: { id: string } }>
      >(response),
  }
}
