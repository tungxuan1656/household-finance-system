import type { CategoryKey } from '@/types/reference-data'

import { getCategoryLabel } from './labels'

export type CategoryPresentation = {
  key: string
  label: string
  iconUrl?: string
  color?: string
}

export type ReferenceCategoryLike = {
  key: CategoryKey
  iconUrl: string
  color: string
}

export function getCategoryPresentation(
  categoryKey: string | undefined,
  categories?: ReferenceCategoryLike[],
): CategoryPresentation {
  if (!categoryKey) {
    return { key: 'unknown', label: getCategoryLabel('other') }
  }

  const category = categories?.find((item) => item.key === categoryKey)

  if (!category) {
    return { key: categoryKey, label: getCategoryLabel('other') }
  }

  return {
    key: categoryKey,
    label: getCategoryLabel(category.key),
    iconUrl: category?.iconUrl,
    color: category?.color,
  }
}
