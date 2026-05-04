'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { t } from '@/lib/i18n/t'
import type {
  BudgetCategoryLimitDTO,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '@/types/budget'

import {
  budgetFormSchema,
  type BudgetFormValues,
  CategoryLimitsSection,
  PeriodField,
  TotalLimitField,
} from './fields'

type BudgetFormProps = {
  mode: 'create' | 'edit'
  initialValues?: Partial<{
    period: string
    totalLimit: number
    categoryLimits: BudgetCategoryLimitDTO[]
  }>
  householdId: string
  onSubmit: (values: CreateBudgetRequest | UpdateBudgetRequest) => void
  onCancel: () => void
  isSubmitting: boolean
}

function BudgetForm({
  mode,
  initialValues,
  householdId,
  onSubmit,
  onCancel,
  isSubmitting,
}: BudgetFormProps) {
  const [categoryLimits, setCategoryLimits] = useState<
    BudgetCategoryLimitDTO[]
  >(initialValues?.categoryLimits ?? [])

  const form = useForm<BudgetFormValues>({
    defaultValues: {
      period: initialValues?.period ?? '',
      totalLimit: initialValues?.totalLimit ?? undefined,
    },
    resolver: zodResolver(budgetFormSchema),
  })

  const handleSubmit = (values: BudgetFormValues) => {
    const payloadCategoryLimits =
      categoryLimits.length > 0
        ? categoryLimits.filter((cl) => cl.limitMinor > 0)
        : undefined

    if (mode === 'create') {
      const payload: CreateBudgetRequest = {
        householdId,
        period: values.period,
        totalLimit: values.totalLimit,
        categoryLimits: payloadCategoryLimits,
      }
      onSubmit(payload)
    } else {
      const payload: UpdateBudgetRequest = {
        totalLimit: values.totalLimit,
        categoryLimits: payloadCategoryLimits,
      }
      onSubmit(payload)
    }
  }

  return (
    <form
      className='flex flex-col gap-5'
      onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        {mode === 'create' && (
          <PeriodField control={form.control} isSubmitting={isSubmitting} />
        )}
        <TotalLimitField control={form.control} isSubmitting={isSubmitting} />
      </FieldGroup>

      <div className='flex flex-col gap-2'>
        <p className='text-sm font-medium'>
          {t('budgets.fields.categoryLimits.label')}
        </p>
        <CategoryLimitsSection
          categoryLimits={categoryLimits}
          isSubmitting={isSubmitting}
          onCategoryLimitsChange={setCategoryLimits}
        />
      </div>

      <DialogFooter>
        <Button
          disabled={isSubmitting}
          type='button'
          variant='ghost'
          onClick={onCancel}>
          {t('common.actions.cancel')}
        </Button>
        <Button disabled={isSubmitting} type='submit'>
          {isSubmitting
            ? mode === 'create'
              ? t('budgets.actions.creating')
              : t('budgets.actions.updating')
            : mode === 'create'
              ? t('budgets.actions.create')
              : t('budgets.actions.update')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export { BudgetForm }
