const encoder = new TextEncoder()

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

export const sha256Hex = async (value: string): Promise<string> => {
  const data = encoder.encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)

  return toHex(new Uint8Array(digest))
}

export const hashRefreshToken = (
  token: string,
  pepper: string,
): Promise<string> => sha256Hex(`${token}.${pepper}`)
