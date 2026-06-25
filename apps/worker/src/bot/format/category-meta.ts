/**
 * Vietnamese category labels matching TMA locale.
 * Key is the reference category key from REFERENCE_CATEGORY_KEYS.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  food: 'Ăn uống',
  transport: 'Di chuyển',
  dating: 'Hẹn hò',
  'living-costs': 'Sinh hoạt phí',
  family: 'Gia đình',
  children: 'Con cái',
  relatives: 'Người thân',
  shopping: 'Mua sắm',
  beauty: 'Làm đẹp',
  health: 'Sức khỏe',
  social: 'Xã giao',
  repairs: 'Sửa chữa',
  work: 'Công việc',
  education: 'Giáo dục',
  investment: 'Đầu tư',
  'self-development': 'Phát triển bản thân',
  sports: 'Thể thao',
  travel: 'Du lịch',
  hobbies: 'Sở thích',
  pets: 'Thú cưng',
  'money-in': 'Tiền vào',
  lending: 'Cho vay',
  charity: 'Từ thiện',
  other: 'Khác',
}

/**
 * Get the Vietnamese label for a category key.
 * Falls back to the key itself if not found.
 */
export const getCategoryLabel = (key: string): string =>
  CATEGORY_LABELS[key] ?? key
