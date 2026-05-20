const getCurrencyFractionDigits = (currencyCode: string): number => {
  try {
    return (
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

export const toMajorUnits = (
  amountMinor: number,
  currencyCode: string,
): number => {
  const fractionDigits = getCurrencyFractionDigits(currencyCode)

  return amountMinor / 10 ** fractionDigits
}

export const formatCurrency = (
  amountMinor: number,
  currencyCode: string,
): string => {
  const majorAmount = toMajorUnits(amountMinor, currencyCode)

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
  }).format(majorAmount)
}

/**
 * Formats a raw user-typed amount string into a dot-separated display string.
 * Strips non-digit characters then formats as vi-VN integer (e.g. "1000" => "1.000").
 * Returns the raw digits-only value for programmatic parsing via parseAmountInput.
 */
export const formatAmountInput = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  return new Intl.NumberFormat('vi-VN').format(Number(digits))
}

/**
 * Parses a dot-separated amount display string back to a plain number.
 * Returns undefined for empty or non-numeric input.
 */
export const parseAmountInput = (value: string): number | undefined => {
  if (!value) return undefined

  const digits = value.replace(/\D/g, '')
  if (!digits) return undefined

  const parsed = Number(digits)

  return Number.isNaN(parsed) ? undefined : parsed
}
