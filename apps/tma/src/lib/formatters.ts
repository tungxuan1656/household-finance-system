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

const TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
})

export const formatVnd = (value: number): string => VND_FORMATTER.format(value)

export const formatMonthLabel = (value: Date): string => {
  const label = MONTH_FORMATTER.format(value)

  return label.slice(0, 1).toUpperCase() + label.slice(1)
}

export const formatDateLabel = (value: string): string =>
  DATE_FORMATTER.format(new Date(value))

export const formatTimeLabel = (value: string): string =>
  TIME_FORMATTER.format(new Date(value))

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
