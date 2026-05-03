'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { t } from '@/lib/i18n/t'
import type {
  CreateExpenseGroupRequest,
  UpdateExpenseGroupRequest,
} from '@/types/group'

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
  householdId: string
  onSubmit: (
    values: CreateExpenseGroupRequest | UpdateExpenseGroupRequest,
  ) => void
  onCancel: () => void
  isSubmitting: boolean
}

function GroupForm({
  mode,
  initialValues,
  householdId,
  onSubmit,
  onCancel,
  isSubmitting,
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
    const payload = {
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
      ...(values.startDate != null ? { startDate: values.startDate } : {}),
      ...(values.endDate != null ? { endDate: values.endDate } : {}),
      ...(values.eventBudget != null
        ? { eventBudget: values.eventBudget }
        : {}),
    }

    if (mode === 'create') {
      onSubmit({
        householdId,
        ...payload,
      } satisfies CreateExpenseGroupRequest)
    } else {
      onSubmit(payload satisfies UpdateExpenseGroupRequest)
    }
  }

  return (
    <form
      className='flex flex-col gap-5'
      onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <NameField control={form.control} isSubmitting={isSubmitting} />
        <DescriptionField control={form.control} isSubmitting={isSubmitting} />
        <StartDateField control={form.control} isSubmitting={isSubmitting} />
        <EndDateField control={form.control} isSubmitting={isSubmitting} />
        <BudgetField control={form.control} isSubmitting={isSubmitting} />
      </FieldGroup>
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
