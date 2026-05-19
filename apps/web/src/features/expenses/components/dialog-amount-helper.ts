const MINOR_MULTIPLIER = 1000

const stripNonDigits = (value: string) => value.replace(/\D+/g, '')

export const formatDialogAmountDisplay = (value: string) => {
  const digits = stripNonDigits(value)
  if (!digits) return ''

  return new Intl.NumberFormat('vi-VN').format(Number(digits))
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
