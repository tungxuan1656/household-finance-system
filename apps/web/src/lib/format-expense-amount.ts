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

export function formatExpenseAmount(
  amountMinor: number,
  currencyCode: string,
): string {
  const decimals = getCurrencyFractionDigits(currencyCode)
  const divisor = 10 ** decimals

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountMinor / divisor)
}
