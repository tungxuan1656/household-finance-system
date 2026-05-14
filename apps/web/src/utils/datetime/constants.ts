export const DATE_TIME_FORMATS = {
  date: 'dd/MM/yyyy',
  dateTime: 'dd/MM/yyyy HH:mm',
  monthYear: 'MM/yyyy',
  time: 'HH:mm',
  timeSeconds: 'HH:mm:ss',
  year: 'yyyy',
} as const

export type DateTimeFormat =
  (typeof DATE_TIME_FORMATS)[keyof typeof DATE_TIME_FORMATS]
