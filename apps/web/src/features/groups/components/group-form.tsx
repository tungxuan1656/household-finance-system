'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import type {
  CreateExpenseGroupRequest,
  UpdateExpenseGroupRequest,
} from '@/features/groups/types/group'
import { t } from '@/lib/i18n/t'
import { cn } from '@/utils/cn'

import {
  BudgetField,
  DescriptionField,
  EndDateField,
  groupFormSchema,
  type GroupFormValues,
  NameField,
  StartDateField,
} from './group-form-fields'

type GroupFormProps = {
  mode: 'create' | 'edit'
  initialValues?: Partial<CreateExpenseGroupRequest>
  householdId?: string | null
  onSubmit: (
    values: CreateExpenseGroupRequest | UpdateExpenseGroupRequest,
  ) => void
  onCancel: () => void
  isSubmitting: boolean
  className?: string
  footerClassName?: string
  showCancelButton?: boolean
}

function GroupForm({
  mode,
  initialValues,
  householdId,
  onSubmit,
  onCancel,
  isSubmitting,
  className,
  footerClassName,
  showCancelButton = true,
}: GroupFormProps) {
  const form = useForm<GroupFormValues>({
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      startDate: initialValues?.startDate ?? undefined,
      endDate: initialValues?.endDate ?? undefined,
      eventBudget: initialValues?.eventBudget ?? undefined,
    },
    resolver: zodResolver(groupFormSchema),
  })
  const handleSubmit = (values: GroupFormValues) => {
    if (mode === 'create') {
      onSubmit({
        name: values.name,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        eventBudget: values.eventBudget,
        ...(householdId ? { householdId } : {}),
      })
    } else {
      onSubmit({
        name: values.name,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        eventBudget: values.eventBudget,
      })
    }
  }

  return (
    <form
      className={cn('flex min-h-0 flex-col gap-4', className)}
      onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup className='gap-4'>
        <NameField control={form.control} isSubmitting={isSubmitting} />
        <DescriptionField control={form.control} isSubmitting={isSubmitting} />
        <StartDateField control={form.control} isSubmitting={isSubmitting} />
        <EndDateField control={form.control} isSubmitting={isSubmitting} />
        <BudgetField control={form.control} isSubmitting={isSubmitting} />
      </FieldGroup>
      <DialogFooter className={footerClassName}>
        {showCancelButton ? (
          <Button
            disabled={isSubmitting}
            type='button'
            variant='ghost'
            onClick={onCancel}>
            {t('common.actions.cancel')}
          </Button>
        ) : null}
        <Button disabled={isSubmitting} type='submit'>
          {isSubmitting
            ? mode === 'create'
              ? t('groups.actions.creating')
              : t('groups.actions.updating')
            : mode === 'create'
              ? t('groups.actions.create')
              : t('groups.actions.update')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export { GroupForm }
