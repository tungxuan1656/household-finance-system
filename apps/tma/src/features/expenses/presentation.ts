import { type HouseholdDTO, SOURCE_KEYS } from '@/features/home/types'

const sourceKeyToI18n = (key: string): string =>
  key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())

const validSourceI18nKeys = new Set(SOURCE_KEYS.map(sourceKeyToI18n))

const sourceI18nKey = (key: string): string => {
  const camel = sourceKeyToI18n(key)

  return validSourceI18nKeys.has(camel) ? camel : 'other'
}

export const getSourceLabel = (
  key: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string => t(`expenseSource.${sourceI18nKey(key)}`)

export const getSourceDetail = (
  key: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string => t(`expenseSourceDetail.${sourceI18nKey(key)}`)

export const getSourceOptions = (
  t: (key: string, options?: Record<string, unknown>) => string,
) =>
  SOURCE_KEYS.map((key) => ({
    id: key,
    label: getSourceLabel(key, t),
    detail: getSourceDetail(key, t),
  }))

export const buildHouseholdNameMap = (
  households: HouseholdDTO[],
): Map<string, string> =>
  new Map(households.map((household) => [household.id, household.name]))
