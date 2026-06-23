/**
 * Pure worker-safe currency utilities.
 * No Hono/contracts imports.
 */

/**
 * Get the number of fraction digits for a currency code.
 * Falls back to 2 for unknown or invalid codes.
 */
export const getCurrencyFractionDigits = (currencyCode: string): number => {
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

/**
 * Convert minor units to major units (e.g. 12345 USD → 123.45).
 */
export const toMajorUnits = (
  amountMinor: number,
  currencyCode: string,
): number => {
  const decimals = getCurrencyFractionDigits(currencyCode)
  const divisor = 10 ** decimals

  return amountMinor / divisor
}

/**
 * Convert major units to minor units (e.g. 123.45 USD → 12345).
 */
export const getMinorUnits = (amount: number, currencyCode: string): number => {
  const decimals = getCurrencyFractionDigits(currencyCode)
  const factor = 10 ** decimals

  return Math.round(amount * factor)
}

/**
 * Format a minor amount to a readable string with thousand separators
 * and correct decimal placement. Suitable for Telegram Vietnamese text.
 *
 * Examples:
 *   formatMinorAmount(30000, 'VND')  → "30.000"
 *   formatMinorAmount(12345, 'USD')  → "123.45"
 *   formatMinorAmount(500, 'JPY')    → "500"
 */
export const formatMinorAmount = (
  amountMinor: number,
  currencyCode: string = 'VND',
): string => {
  const decimals = getCurrencyFractionDigits(currencyCode)
  const divisor = 10 ** decimals
  const major = amountMinor / divisor

  const parts = major.toFixed(decimals).split('.')
  const intPart = parts[0]
  const fracPart = parts[1]

  // Add thousand separators to integer part
  const formattedInt = intPart
    .split('')
    .reverse()
    .reduce((acc: string[], digit, index) => {
      if (index > 0 && index % 3 === 0) {
        acc.unshift('.')
      }
      acc.unshift(digit)

      return acc
    }, [])
    .join('')

  if (fracPart && Number(fracPart) > 0) {
    // Trim trailing zeros from fractional part
    const trimmedFrac = fracPart.replace(/0+$/, '')

    return `${formattedInt},${trimmedFrac}`
  }

  return formattedInt
}
