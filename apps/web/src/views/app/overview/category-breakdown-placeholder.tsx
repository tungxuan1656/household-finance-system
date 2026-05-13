import { CategoryBreakdown } from '@/components/home/category-breakdown'
import type { AnalyticsTopCategoryDTO } from '@/types/analytics'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

export function CategoryBreakdownPlaceholder({
  categories,
  currencyCode,
  referenceCategories,
}: {
  categories: AnalyticsTopCategoryDTO[]
  currencyCode: string
  referenceCategories?: ReferenceCategoryDTO[]
}) {
  if (categories.length === 0) {
    return (
      <CategoryBreakdown
        isEmpty
        categories={[]}
        currencyCode={currencyCode}
        isLoading={false}
        referenceCategories={referenceCategories}
        totalSpendMinor={0}
      />
    )
  }

  return (
    <CategoryBreakdown
      categories={categories}
      currencyCode={currencyCode}
      isEmpty={false}
      isLoading={false}
      referenceCategories={referenceCategories}
      totalSpendMinor={0}
    />
  )
}
