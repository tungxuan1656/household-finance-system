'use client'

import { type Control, useController, useWatch } from 'react-hook-form'

import { CategoryPicker } from '@/components/expense/category-picker'
import { SourcePicker } from '@/components/expense/source-picker'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { localDateToTimestamp, timestampToLocalDate } from '@/lib/date-utils'
import type { ExpenseFormInputValues } from '@/lib/forms/expense.schema'
import { t } from '@/lib/i18n/t'
import { getCategoryLabel } from '@/lib/reference-data/labels'
import type { ExpenseGroupDTO } from '@/types/group'
import type { HouseholdDTO, HouseholdMemberDTO } from '@/types/household'
import type { CurrentUserProfileDTO } from '@/types/profile'
import type { ReferenceCategoryDTO } from '@/types/reference-data'

import { GroupPicker } from './group-picker'

type FieldProps = {
  control: Control<ExpenseFormInputValues>
  isSubmitting: boolean
  inputRef?: (node: HTMLInputElement | null) => void
}

function AmountField({ control, isSubmitting, inputRef }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'amount' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-amount'>{t('expense.amount')}</FieldLabel>
      <Input
        {...field}
        ref={(node) => {
          field.ref(node)
          inputRef?.(node)
        }}
        aria-invalid={fieldState.invalid}
        className='h-12 text-2xl font-semibold'
        disabled={isSubmitting}
        id='expense-amount'
        inputMode='decimal'
        min='0'
        placeholder='0'
        step='0.01'
        type='number'
        value={field.value ?? ''}
        onChange={(e) => {
          const val = e.target.value
          field.onChange(val === '' ? undefined : parseFloat(val))
        }}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

type CategoryFieldProps = FieldProps & {
  categories: ReferenceCategoryDTO[]
}

function CategoryField({
  control,
  isSubmitting,
  categories,
}: CategoryFieldProps) {
  const { field, fieldState } = useController({ control, name: 'categoryKey' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-category'>
        {t('expense.category')}
      </FieldLabel>
      <CategoryPicker
        categories={categories}
        disabled={isSubmitting}
        id='expense-category'
        value={field.value}
        onValueChange={(value) => field.onChange(value)}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

function SourceField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'sourceKey' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-source'>{t('expense.source')}</FieldLabel>
      <SourcePicker
        disabled={isSubmitting}
        id='expense-source'
        value={field.value}
        onValueChange={(value) => field.onChange(value)}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

function TitleField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'title' })
  const watchedCategoryKey = useWatch({ control, name: 'categoryKey' })
  const categoryLabel = watchedCategoryKey
    ? getCategoryLabel(watchedCategoryKey)
    : ''

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-title'>{t('expense.title')}</FieldLabel>
      <Input
        {...field}
        aria-invalid={fieldState.invalid}
        disabled={isSubmitting}
        id='expense-title'
        placeholder={categoryLabel || t('expense.title')}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

function DateField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'occurredAt' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-date'>{t('expense.date')}</FieldLabel>
      <Input
        aria-invalid={fieldState.invalid}
        disabled={isSubmitting}
        id='expense-date'
        type='date'
        value={field.value ? timestampToLocalDate(field.value) : ''}
        onChange={(e) => {
          const val = e.target.value
          field.onChange(val ? localDateToTimestamp(val) : undefined)
        }}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

function NoteField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'note' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-note'>{t('expense.note')}</FieldLabel>
      <Textarea
        {...field}
        aria-invalid={fieldState.invalid}
        disabled={isSubmitting}
        id='expense-note'
        placeholder={t('expense.note')}
        value={field.value ?? ''}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

function VisibilityField({ control, isSubmitting }: FieldProps) {
  const { field, fieldState } = useController({ control, name: 'visibility' })

  return (
    <Field data-invalid={fieldState.invalid} orientation='horizontal'>
      <FieldLabel htmlFor='expense-visibility'>
        {t('expense.visibilityLabel')}
      </FieldLabel>
      <Switch
        aria-invalid={fieldState.invalid}
        checked={field.value === 'household'}
        disabled={isSubmitting}
        id='expense-visibility'
        onCheckedChange={(checked) => {
          field.onChange(checked ? 'household' : 'private')
        }}
      />
      <FieldDescription>
        {field.value === 'household'
          ? t('expense.visibility.household')
          : t('expense.visibility.private')}
      </FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

type GroupFieldProps = FieldProps & {
  groups: ExpenseGroupDTO[]
}

function GroupField({ control, isSubmitting, groups }: GroupFieldProps) {
  const { field, fieldState } = useController({ control, name: 'groupIds' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-groups'>
        {t('expense.groupPicker.label')}
      </FieldLabel>
      <GroupPicker
        disabled={isSubmitting}
        groups={groups}
        id='expense-groups'
        value={field.value ?? []}
        onValueChange={(value) => field.onChange(value)}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

type HouseholdFieldProps = FieldProps & {
  households: HouseholdDTO[]
}

function HouseholdField({
  control,
  isSubmitting,
  households,
}: HouseholdFieldProps) {
  const { field, fieldState } = useController({ control, name: 'householdId' })

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='expense-household'>
        {t('expense.selectHousehold')}
      </FieldLabel>
      <NativeSelect
        aria-invalid={fieldState.invalid}
        disabled={isSubmitting}
        id='expense-household'
        value={field.value ?? ''}
        onChange={(e) => {
          field.onChange(e.target.value || undefined)
        }}>
        <NativeSelectOption value=''>
          {t('expense.selectHousehold')}
        </NativeSelectOption>
        {households.map((household) => (
          <NativeSelectOption key={household.id} value={household.id}>
            {household.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )
}

type PayerFieldProps = FieldProps & {
  profile: CurrentUserProfileDTO | undefined
  payerOptions: HouseholdMemberDTO[]
  watchedVisibility: string | undefined
}

function PayerField({
  control,
  isSubmitting,
  profile,
  payerOptions,
  watchedVisibility,
}: PayerFieldProps) {
  const { field, fieldState } = useController({ control, name: 'payerUserId' })

  return (
    <Field>
      <FieldLabel>{t('expense.payer')}</FieldLabel>
      {watchedVisibility === 'household' && payerOptions.length > 0 ? (
        <Field data-invalid={fieldState.invalid}>
          <NativeSelect
            aria-invalid={fieldState.invalid}
            disabled={isSubmitting}
            value={field.value ?? profile?.id ?? ''}
            onChange={(event) => {
              field.onChange(event.target.value || undefined)
            }}>
            {payerOptions.map((member) => (
              <NativeSelectOption key={member.userId} value={member.userId}>
                {member.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </Field>
      ) : (
        <Input
          readOnly
          className='cursor-default bg-muted'
          value={profile?.displayName ?? ''}
        />
      )}
    </Field>
  )
}

export {
  AmountField,
  CategoryField,
  DateField,
  GroupField,
  HouseholdField,
  NoteField,
  PayerField,
  SourceField,
  TitleField,
  VisibilityField,
}
