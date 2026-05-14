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
