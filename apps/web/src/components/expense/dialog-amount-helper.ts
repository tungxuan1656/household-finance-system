const MINOR_MULTIPLIER = 1000

const stripNonDigits = (value: string) => value.replace(/\D+/g, '')

export const formatDialogAmountDisplay = (value: string) => {
  const digits = stripNonDigits(value)
  if (!digits) return ''

  const canonicalMinor = BigInt(digits) * BigInt(MINOR_MULTIPLIER)

  return new Intl.NumberFormat('vi-VN').format(Number(canonicalMinor)) + ' đ'
}

export const parseDialogAmountSubmitMinor = (value: string) => {
  const digits = stripNonDigits(value)
  if (!digits) return null

  return Number(BigInt(digits) * BigInt(MINOR_MULTIPLIER))
}
