import {
  upsertUserByFirebaseIdentity,
  upsertUserByTelegramIdentity,
} from '@/db/repositories/user-repository'
import { issueAppSession } from '@/handlers/auth/issue-app-session'
import { verifyFirebaseIdToken } from '@/lib/auth/firebase'
import { verifyTelegramLaunchData } from '@/lib/auth/telegram'
import { readConfig } from '@/lib/env'
import type { ExchangeProviderTokenInput } from '@/types'

export const exchangeProviderToken = async (
  env: AppBindings['Bindings'],
  input: ExchangeProviderTokenInput,
): Promise<Awaited<ReturnType<typeof issueAppSession>>> => {
  const config = readConfig(env)

  if (input.provider === 'telegram') {
    const identity = await verifyTelegramLaunchData(input.initData, {
      botToken: config.telegramBotToken,
      freshnessWindowSeconds: config.telegramFreshnessWindowSeconds,
      locale: input.locale,
    })

    const user = await upsertUserByTelegramIdentity(
      env.DB,
      identity,
      input.locale,
    )

    return issueAppSession(env, {
      user,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      provider: 'telegram',
    })
  }

  const firebaseIdentity = await verifyFirebaseIdToken(
    input.idToken,
    config,
    input.locale,
  )

  const user = await upsertUserByFirebaseIdentity(
    env.DB,
    {
      subject: firebaseIdentity.sub,
      email: firebaseIdentity.email,
      name: firebaseIdentity.name,
      picture: firebaseIdentity.picture,
    },
    input.locale,
  )

  return issueAppSession(env, {
    user,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
    provider: 'firebase',
  })
}

type AppBindings = { Bindings: Env }
