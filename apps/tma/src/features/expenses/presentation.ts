import type { HouseholdDTO, SourceKey } from '@/features/home/types'

const SOURCE_LABELS: Record<SourceKey, string> = {
  cash: 'Tiền mặt',
  'bank-transfer': 'Chuyển khoản',
  card: 'Thẻ tín dụng',
  momo: 'Ví MoMo',
  'zalo-pay': 'Ví ZaloPay',
  'shopee-pay': 'Ví ShopeePay',
  other: 'Khác',
}

export const getSourceLabel = (key: string): string =>
  SOURCE_LABELS[key as SourceKey] ?? SOURCE_LABELS.other

export const buildHouseholdNameMap = (
  households: HouseholdDTO[],
): Map<string, string> =>
  new Map(households.map((household) => [household.id, household.name]))
