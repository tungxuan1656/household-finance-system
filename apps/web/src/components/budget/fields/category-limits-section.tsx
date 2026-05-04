'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useReferenceCategoriesQuery } from '@/hooks/api/use-reference-data'
import { t } from '@/lib/i18n/t'
import type { BudgetCategoryLimitDTO } from '@/types/budget'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

import { CategoryLimitRow } from './category-limit-row'

type CategoryLimitsSectionProps = {
  categoryLimits: BudgetCategoryLimitDTO[]
  onCategoryLimitsChange: (limits: BudgetCategoryLimitDTO[]) => void
  isSubmitting: boolean
}

function CategoryLimitsSection({
  categoryLimits,
  onCategoryLimitsChange,
  isSubmitting,
}: CategoryLimitsSectionProps) {
  const { data: categoriesData } = useReferenceCategoriesQuery()
  const allCategories = categoriesData?.items ?? []

  const expenseCategories = allCategories.filter(
    (cat) => cat.kind === 'expense',
  )

  const usedKeys = new Set(categoryLimits.map((cl) => cl.categoryKey))
  const availableCategories = expenseCategories.filter(
    (cat) => !usedKeys.has(cat.key),
  )

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('')

  const handleAddCategory = () => {
    if (!selectedCategoryKey) return

    const category = expenseCategories.find(
      (cat) => cat.key === selectedCategoryKey,
    )
    if (!category) return

    const newLimits = [
      ...categoryLimits,
      { categoryKey: category.key, limitMinor: 0 },
    ]
    onCategoryLimitsChange(newLimits)
    setSelectedCategoryKey('')
  }

  const handleLimitChange = (categoryKey: string, value: string) => {
    const newLimits = categoryLimits.map((cl) =>
      cl.categoryKey === categoryKey
        ? { ...cl, limitMinor: value === '' ? 0 : Number(value) }
        : cl,
    )
    onCategoryLimitsChange(newLimits)
  }

  const handleRemove = (categoryKey: string) => {
    onCategoryLimitsChange(
      categoryLimits.filter((cl) => cl.categoryKey !== categoryKey),
    )
  }

  const getCategoryByKey = (key: string): ReferenceCategoryDTO | undefined => {
    return expenseCategories.find((cat) => cat.key === key)
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <Select
          disabled={isSubmitting || availableCategories.length === 0}
          value={selectedCategoryKey}
          onValueChange={setSelectedCategoryKey}>
          <SelectTrigger className='flex-1'>
            <SelectValue
              placeholder={t('budgets.fields.categoryLimits.selectCategory')}
            />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((cat) => (
              <SelectItem key={cat.key} value={cat.key}>
                <span className='flex items-center gap-2'>
                  <span
                    className='inline-block h-2.5 w-2.5 rounded-full'
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.key}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={
            isSubmitting ||
            !selectedCategoryKey ||
            availableCategories.length === 0
          }
          type='button'
          variant='outline'
          onClick={handleAddCategory}>
          <Plus data-icon='inline-start' />
          {t('budgets.fields.categoryLimits.add')}
        </Button>
      </div>

      {categoryLimits.length > 0 && (
        <div className='flex flex-col gap-2'>
          {categoryLimits.map((cl) => {
            const category = getCategoryByKey(cl.categoryKey)
            if (!category) return null

            return (
              <CategoryLimitRow
                key={cl.categoryKey}
                category={category}
                isSubmitting={isSubmitting}
                limitValue={cl.limitMinor === 0 ? '' : String(cl.limitMinor)}
                onLimitChange={(value) =>
                  handleLimitChange(cl.categoryKey, value)
                }
                onRemove={() => handleRemove(cl.categoryKey)}
              />
            )
          })}
        </div>
      )}

      {categoryLimits.length === 0 && (
        <p className='text-sm text-muted-foreground'>
          {t('budgets.fields.categoryLimits.empty')}
        </p>
      )}
    </div>
  )
}

export { CategoryLimitsSection }
