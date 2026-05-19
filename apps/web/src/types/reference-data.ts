export const CATEGORY_KINDS = {
  expense: 'expense',
  income: 'income',
  transfer: 'transfer',
} as const

export type CategoryKind = (typeof CATEGORY_KINDS)[keyof typeof CATEGORY_KINDS]

export const CATEGORY_KEYS = [
  'food',
  'transport',
  'dating',
  'living-costs',
  'family',
  'children',
  'relatives',
  'shopping',
  'beauty',
  'health',
  'social',
  'repairs',
  'work',
  'education',
  'investment',
  'self-development',
  'sports',
  'travel',
  'hobbies',
  'pets',
  'money-in',
  'lending',
  'charity',
  'other',
] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export const SOURCE_KEYS = [
  'cash',
  'bank-transfer',
  'card',
  'momo',
  'zalo-pay',
  'shopee-pay',
  'other',
] as const

export type SourceKey = (typeof SOURCE_KEYS)[number]

export type ReferenceCategoryDTO = {
  key: CategoryKey
  kind: CategoryKind
  iconUrl: string
  color: string
}

export type ReferenceSourceDTO = {
  key: SourceKey
}

export type ListReferenceCategoriesResponse = {
  items: ReferenceCategoryDTO[]
}

export type ListReferenceSourcesResponse = {
  items: ReferenceSourceDTO[]
}
