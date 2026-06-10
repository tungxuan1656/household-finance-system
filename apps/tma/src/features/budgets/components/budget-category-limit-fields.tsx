import {
  CardDescription,
  Eyebrow,
  Field,
  FieldLabel,
  Input,
} from '@/components/ui'
import {
  formatCurrencyMinor,
  getCategoryPresentation,
} from '@/features/home/presentation'
import type { CategoryKey, ReferenceCategoryDTO } from '@/features/home/types'
import { formatAmountInput } from '@/lib/formatters'

type CategoryLimitInputMap = Partial<Record<CategoryKey, string>>

type BudgetCategoryLimitFieldsProps = {
  disabled?: boolean
  inputs: CategoryLimitInputMap
  referenceCategories: ReferenceCategoryDTO[]
  onChange: (inputs: CategoryLimitInputMap) => void
}

export const getExpenseBudgetCategories = (
  referenceCategories: ReferenceCategoryDTO[],
) => referenceCategories.filter((category) => category.kind === 'expense')

export const BudgetCategoryLimitFields = ({
  disabled = false,
  inputs,
  referenceCategories,
  onChange,
}: BudgetCategoryLimitFieldsProps) => {
  const expenseCategories = getExpenseBudgetCategories(referenceCategories)

  return (
    <div className='grid gap-2'>
      <div>
        <FieldLabel>Hạn mức theo danh mục</FieldLabel>
        <CardDescription className='mt-1'>
          Không bắt buộc. Chỉ nhập các danh mục cần theo dõi riêng.
        </CardDescription>
      </div>

      <div className='grid gap-2'>
        {expenseCategories.map((category) => {
          const presentation = getCategoryPresentation(category.key, [category])

          return (
            <Field
              key={category.key}
              className='grid grid-cols-[1fr_minmax(118px,150px)] items-center gap-3 rounded-[18px] bg-black/[0.04] p-3'>
              <div className='min-w-0'>
                <Eyebrow>{presentation.label}</Eyebrow>
                <CardDescription className='truncate'>
                  {inputs[category.key]
                    ? formatCurrencyMinor(
                        Number(inputs[category.key]!.replaceAll(/\D/g, '')),
                        'VND',
                      )
                    : 'Chưa đặt'}
                </CardDescription>
              </div>
              <Input
                className='min-h-11 rounded-2xl px-3 text-right text-sm'
                disabled={disabled}
                inputMode='numeric'
                placeholder='0'
                value={inputs[category.key] ?? ''}
                onChange={(event) => {
                  onChange({
                    ...inputs,
                    [category.key]: formatAmountInput(event.target.value),
                  })
                }}
              />
            </Field>
          )
        })}
      </div>
    </div>
  )
}

export type { CategoryLimitInputMap }
