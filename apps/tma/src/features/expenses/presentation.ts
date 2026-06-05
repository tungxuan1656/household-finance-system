import {
  type HouseholdDTO,
  SOURCE_KEYS,
  type SourceKey,
} from '@/features/home/types'

const SOURCE_LABELS: Record<SourceKey, string> = {
  cash: 'Tiền mặt',
  'bank-transfer': 'Chuyển khoản',
  card: 'Thẻ tín dụng',
  momo: 'Ví MoMo',
  'zalo-pay': 'Ví ZaloPay',
  'shopee-pay': 'Ví ShopeePay',
  other: 'Khác',
}

const SOURCE_DETAILS: Record<SourceKey, string> = {
  cash: 'Ví cá nhân',
  'bank-transfer': 'Tài khoản ngân hàng',
  card: 'Thẻ thanh toán',
  momo: 'Ví điện tử',
  'zalo-pay': 'Ví điện tử',
  'shopee-pay': 'Ví điện tử',
  other: 'Nguồn tiền khác',
}

export const getSourceLabel = (key: string): string =>
  SOURCE_LABELS[key as SourceKey] ?? SOURCE_LABELS.other

export const getSourceOptions = () =>
  SOURCE_KEYS.map((key) => ({
    id: key,
    label: getSourceLabel(key),
    detail: SOURCE_DETAILS[key],
  }))

export const buildHouseholdNameMap = (
  households: HouseholdDTO[],
): Map<string, string> =>
  new Map(households.map((household) => [household.id, household.name]))
