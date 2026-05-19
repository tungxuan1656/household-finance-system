const MINOR_MULTIPLIER = 1000

const stripNonDigits = (value: string) => value.replace(/\D+/g, '')

const formatCanonicalMinor = (minorAmount: bigint) =>
  new Intl.NumberFormat('vi-VN').format(Number(minorAmount))

export const formatDialogAmountDisplay = (value: string) => {
  const digits = stripNonDigits(value)
  if (!digits) return ''

  const canonicalMinor = BigInt(digits) * BigInt(MINOR_MULTIPLIER)

  return `${formatCanonicalMinor(canonicalMinor)} đ`
}

export const parseDialogAmountSubmitMinor = (value: string) => {
  const digits = stripNonDigits(value)
  if (!digits) return null

  return Number(BigInt(digits)) * MINOR_MULTIPLIER
}

export const parseDialogAmountRawFromStoredMinor = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return ''
  }

  return String(Math.floor(value / MINOR_MULTIPLIER))
}
