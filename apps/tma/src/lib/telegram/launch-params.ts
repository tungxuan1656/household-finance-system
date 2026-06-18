import { initData, retrieveRawInitData } from '@tma.js/sdk'

export const readRawInitData = (): string | null => {
  try {
    const raw = retrieveRawInitData()
    if (typeof raw === 'string' && raw.length > 0) {
      return raw
    }
  } catch {
    // not in TMA environment
  }

  return null
}

/**
 * Returns the Telegram user id from the restored initData.
 *
 * This is a **cache-invalidation key**, not an authenticated identity. It is
 * used to match a cached session blob against the current Telegram account so
 * that a shared device never reuses another user's tokens. The server remains
 * the source of truth for identity (JWT signature + refresh-token ownership).
 *
 * Returns null outside a TMA environment (e.g. local browser dev).
 */
export const readTelegramUserId = (): number | null => {
  try {
    const user = initData.user()

    if (user && typeof user.id === 'number') {
      return user.id
    }
  } catch {
    // not in TMA environment
  }

  return null
}
