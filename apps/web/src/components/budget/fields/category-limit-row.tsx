'use client'

import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { t } from '@/lib/i18n/t'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

type CategoryLimitRowProps = {
  category: ReferenceCategoryDTO
  limitValue: string
  onLimitChange: (value: string) => void
  onRemove: () => void
  isSubmitting: boolean
}

function CategoryLimitRow({
  category,
  limitValue,
  onLimitChange,
  onRemove,
  isSubmitting,
}: CategoryLimitRowProps) {
  return (
    <div className='flex items-center gap-3'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <span
          className='inline-block h-3 w-3 shrink-0 rounded-full'
          style={{ backgroundColor: category.color }}
        />
        <span className='truncate text-sm'>{category.key}</span>
      </div>
      <div className='w-36'>
        <Input
          disabled={isSubmitting}
          min={1}
          placeholder={t('budgets.fields.categoryLimits.placeholder')}
          type='number'
          value={limitValue}
          onChange={(e) => onLimitChange(e.target.value)}
        />
      </div>
      <Button
        disabled={isSubmitting}
        size='icon'
        type='button'
        variant='ghost'
        onClick={onRemove}>
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  )
}

export { CategoryLimitRow }
