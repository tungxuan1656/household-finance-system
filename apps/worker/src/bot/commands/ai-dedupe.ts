/**
 * Compute a dedupe key: SHA-256 of (telegramUserId + "|" + rawText + "|" + occurredAt).
 */
export const computeDedupeKey = async (
  telegramUserId: string,
  rawText: string,
  occurredAt: string,
): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${telegramUserId}|${rawText}|${occurredAt}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
