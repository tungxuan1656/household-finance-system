const VND_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const MONTH_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  month: 'long',
  year: 'numeric',
})

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export const formatVnd = (value: number): string => VND_FORMATTER.format(value)

export const formatMonthLabel = (value: Date): string => {
  const label = MONTH_FORMATTER.format(value)

  return label.slice(0, 1).toUpperCase() + label.slice(1)
}

export const formatPeriodLabel = (period: string): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(period)

  if (!match) {
    return period
  }

  return `${match[2]}/${match[1]}`
}

export const formatDateLabel = (value: string): string =>
  DATE_FORMATTER.format(new Date(value))

export const formatAmountInput = (value: string): string => {
  const digits = value.replaceAll(/\D/g, '')

  if (digits.length === 0) {
    return ''
  }

  return new Intl.NumberFormat('vi-VN').format(Number(digits))
}

export const parseAmountInput = (value: string): number => {
  const digits = value.replaceAll(/\D/g, '')

  return digits.length > 0 ? Number(digits) : 0
}

export const MINOR_MULTIPLIER = 1000

export const minorFromRaw = (raw: number): number => raw * MINOR_MULTIPLIER

export const rawFromMinor = (minor: number): number => {
  if (!Number.isFinite(minor) || minor <= 0) return 0

  return Math.floor(minor / MINOR_MULTIPLIER)
}

export const minorFromInput = (value: string): number | null => {
  const raw = parseAmountInput(value)

  return raw > 0 ? minorFromRaw(raw) : null
}

export const currencyDisplaySymbol = (code: string): string =>
  code === 'VND' ? '₫' : code
