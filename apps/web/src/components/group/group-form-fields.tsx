'use client'

import { type Control, Controller } from 'react-hook-form'
import { z } from 'zod'

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { t } from '@/lib/i18n/t'

export const groupFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  eventBudget: z.number().positive().optional(),
})

export type GroupFormValues = z.infer<typeof groupFormSchema>

type BaseFieldProps = {
  control: Control<GroupFormValues>
  isSubmitting: boolean
}

function NameField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='name'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-name'>
            {t('groups.fields.name.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-name'
              placeholder={t('groups.fields.name.placeholder')}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </FieldContent>
        </Field>
      )}
    />
  )
}

function DescriptionField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='description'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-description'>
            {t('groups.fields.description.label')}
          </FieldLabel>
          <FieldContent>
            <Textarea
              {...field}
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-description'
              placeholder={t('groups.fields.description.placeholder')}
              value={field.value ?? ''}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </FieldContent>
        </Field>
      )}
    />
  )
}

function timestampToDateString(ts: number | undefined | null): string {
  if (ts == null) {
    return ''
  }

  return new Date(ts).toISOString().split('T')[0]
}

function dateStringToTimestamp(dateStr: string): number | undefined {
  if (!dateStr) {
    return undefined
  }

  return new Date(dateStr).getTime()
}

function StartDateField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='startDate'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-start-date'>
            {t('groups.fields.startDate.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-start-date'
              type='date'
              value={timestampToDateString(field.value)}
              onBlur={field.onBlur}
              onChange={(e) => {
                field.onChange(dateStringToTimestamp(e.target.value))
              }}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </FieldContent>
        </Field>
      )}
    />
  )
}

function EndDateField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='endDate'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-end-date'>
            {t('groups.fields.endDate.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-end-date'
              type='date'
              value={timestampToDateString(field.value)}
              onBlur={field.onBlur}
              onChange={(e) => {
                field.onChange(dateStringToTimestamp(e.target.value))
              }}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </FieldContent>
        </Field>
      )}
    />
  )
}

function BudgetField({ control, isSubmitting }: BaseFieldProps) {
  return (
    <Controller
      control={control}
      name='eventBudget'
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor='group-budget'>
            {t('groups.fields.eventBudget.label')}
          </FieldLabel>
          <FieldContent>
            <Input
              aria-invalid={fieldState.invalid}
              disabled={isSubmitting}
              id='group-budget'
              placeholder={t('groups.fields.eventBudget.placeholder')}
              type='number'
              value={field.value ?? ''}
              onBlur={field.onBlur}
              onChange={(e) => {
                const val = e.target.value
                field.onChange(val === '' ? undefined : Number(val))
              }}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </FieldContent>
        </Field>
      )}
    />
  )
}

export {
  BudgetField,
  DescriptionField,
  EndDateField,
  NameField,
  StartDateField,
}
