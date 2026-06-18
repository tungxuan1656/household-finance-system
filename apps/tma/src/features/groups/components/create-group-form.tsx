import { useTranslation } from 'react-i18next'

import {
  Button,
  Card,
  CardTitle,
  Field,
  FieldLabel,
  Input,
  Textarea,
} from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
import {
  NativePicker,
  type NativePickerOption,
} from '@/components/ui/native-picker'
import { formatAmountInput } from '@/lib/formatters'

export type CreateGroupFormProps = {
  isBusy: boolean
  isHouseholdsLoading: boolean
  contextOptions: NativePickerOption[]
  contextValue: string
  budgetInput: string
  description: string
  endDate: string
  name: string
  startDate: string
  onBudgetChange: (v: string) => void
  onCancel: () => void
  onContextChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onEndDateChange: (v: string) => void
  onNameChange: (v: string) => void
  onStartDateChange: (v: string) => void
  onSubmit: () => void
}

export const CreateGroupForm = ({
  isBusy,
  isHouseholdsLoading,
  contextOptions,
  contextValue,
  budgetInput,
  description,
  endDate,
  name,
  startDate,
  onBudgetChange,
  onCancel,
  onContextChange,
  onDescriptionChange,
  onEndDateChange,
  onNameChange,
  onStartDateChange,
  onSubmit,
}: CreateGroupFormProps) => {
  const { t } = useTranslation()

  return (
    <section className='mt-6'>
      <CardTitle className='mb-3'>{t('groups.createPage.header')}</CardTitle>

      <Card>
        <form
          className='grid gap-3.5'
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}>
          <Field>
            <FieldLabel>{t('groups.createPage.fieldName')}</FieldLabel>
            <Input
              disabled={isBusy}
              maxLength={200}
              placeholder={t('groups.createPage.namePlaceholder')}
              type='text'
              value={name}
              onChange={(event) => {
                onNameChange(event.target.value)
              }}
            />
          </Field>

          <Field>
            <FieldLabel>{t('groups.createPage.fieldContext')}</FieldLabel>
            <NativePicker
              fullWidth
              aria-label={t('groups.createPage.contextPlaceholder')}
              disabled={isBusy || isHouseholdsLoading}
              options={contextOptions}
              value={contextValue}
              onChange={(next) => {
                onContextChange(next)
              }}
            />
          </Field>

          <Field>
            <FieldLabel>{t('groups.createPage.fieldDescription')}</FieldLabel>
            <Textarea
              disabled={isBusy}
              maxLength={1000}
              placeholder={t('groups.createPage.descriptionHelp')}
              value={description}
              onChange={(event) => {
                onDescriptionChange(event.target.value)
              }}
            />
          </Field>

          <div className='grid gap-3.5'>
            <Field>
              <FieldLabel>{t('groups.createPage.fieldStartDate')}</FieldLabel>
              <DatePicker
                fullWidth
                aria-label={t('groups.createPage.startDatePlaceholder')}
                disabled={isBusy}
                value={startDate}
                onChange={(next) => {
                  onStartDateChange(next)
                }}
              />
            </Field>

            <Field>
              <FieldLabel>{t('groups.createPage.fieldEndDate')}</FieldLabel>
              <DatePicker
                fullWidth
                aria-label={t('groups.createPage.endDatePlaceholder')}
                disabled={isBusy}
                value={endDate}
                onChange={(next) => {
                  onEndDateChange(next)
                }}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>{t('groups.createPage.fieldBudget')}</FieldLabel>
            <Input
              disabled={isBusy}
              inputMode='numeric'
              placeholder={t('groups.createPage.budgetPlaceholder')}
              value={budgetInput}
              onChange={(event) => {
                onBudgetChange(formatAmountInput(event.target.value))
              }}
            />
          </Field>
          <div className='flex flex-wrap justify-end gap-2.5'>
            <Button
              disabled={isBusy}
              type='button'
              variant='ghost'
              onClick={onCancel}>
              {t('common.cancel')}
            </Button>

            <Button disabled={isBusy} type='submit' variant='secondary'>
              {isBusy
                ? t('groups.createPage.submitting')
                : t('groups.createPage.title')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
