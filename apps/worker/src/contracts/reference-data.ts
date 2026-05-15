import { z } from 'zod'

export const REFERENCE_CATEGORY_KINDS = [
  'expense',
  'income',
  'transfer',
] as const

export const REFERENCE_CATEGORY_KEYS = [
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

export const REFERENCE_SOURCE_KEYS = [
  'cash',
  'bank-transfer',
  'card',
  'momo',
  'zalo-pay',
  'shopee-pay',
  'other',
] as const

export const referenceCategoryKindSchema = z.enum(REFERENCE_CATEGORY_KINDS)
export const referenceCategoryKeySchema = z.enum(REFERENCE_CATEGORY_KEYS)
export const referenceSourceKeySchema = z.enum(REFERENCE_SOURCE_KEYS)

export const referenceCategorySchema = z
  .object({
    key: referenceCategoryKeySchema,
    kind: referenceCategoryKindSchema,
    iconUrl: z.url(),
    color: z.string().trim().min(1),
  })
  .strict()

export const referenceSourceSchema = z
  .object({
    key: referenceSourceKeySchema,
  })
  .strict()

export type ReferenceCategoryKind = z.infer<typeof referenceCategoryKindSchema>
export type ReferenceCategoryKey = z.infer<typeof referenceCategoryKeySchema>
export type ReferenceSourceKey = z.infer<typeof referenceSourceKeySchema>
export type ReferenceCategoryDTO = z.infer<typeof referenceCategorySchema>
export type ReferenceSourceDTO = z.infer<typeof referenceSourceSchema>

export interface ListCategoriesResponse {
  items: ReferenceCategoryDTO[]
}

export interface ListSourcesResponse {
  items: ReferenceSourceDTO[]
}
