import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DatePicker } from '@/components/shared/date-picker'
import { NativePicker } from '@/components/shared/native-picker'
import { TmaCategoryIconBadge } from '@/components/shared/tma-page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { EditExpenseDraft } from '@/features/expenses/model/store'
import { useEditExpenseStore } from '@/features/expenses/model/store'
import type { SourceKey } from '@/features/home/types'
import { getExpenseEditCategoryPath } from '@/lib/constants/routes'
import { currencyDisplaySymbol } from '@/lib/formatters'
import { selection } from '@/lib/telegram/haptics'

import { EditSelectRow } from './expense-edit-select-row'

interface ExpenseEditFormProps {
  draft: EditExpenseDraft
  amountInput: string
  onAmountChange: (value: string) => void
  activeCategory: {
    label: string
    symbol: string
    iconUrl?: string
    accent: { background: string; foreground: string }
  }
  currencyCode: string
  expenseId: string
  sourcePickerOptions: { value: string; label: string }[]
  householdPickerOptions: { value: string; label: string }[]
  groupPickerOptions: { value: string; label: string }[]
}

export const ExpenseEditForm = ({
  draft,
  amountInput,
  onAmountChange,
  activeCategory,
  currencyCode,
  expenseId,
  sourcePickerOptions,
  householdPickerOptions,
  groupPickerOptions,
}: ExpenseEditFormProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)

  return (
    <>
      <Card size='sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm tracking-normal normal-case'>
            {t('expenses.edit.fieldAmount')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className='gap-4'>
            <Field>
              <FieldLabel htmlFor='edit-expense-amount'>
                {t('expenses.edit.fieldAmount')}
              </FieldLabel>
              <div className='flex items-end gap-2'>
                <div className='min-w-0 flex-1'>
                  <Input
                    className='text-right font-mono text-2xl font-semibold sm:text-3xl'
                    id='edit-expense-amount'
                    inputMode='numeric'
                    placeholder='0'
                    type='text'
                    value={amountInput}
                    onChange={(event) => onAmountChange(event.target.value)}
                  />
                </div>
                <span className='shrink-0 font-mono text-2xl font-semibold text-foreground/80 sm:text-3xl'>
                  .000
                </span>
                <span className='shrink-0 text-xs font-semibold text-muted-foreground'>
                  {currencyDisplaySymbol(currencyCode)}
                </span>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor='edit-expense-title'>
                {t('expenses.edit.fieldName')}
              </FieldLabel>
              <Input
                id='edit-expense-title'
                placeholder={t('expenses.edit.fieldNamePlaceholder')}
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card size='sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm tracking-normal normal-case'>
            {t('expenses.edit.fieldDate')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className='gap-4'>
            <Field>
              <FieldLabel htmlFor='edit-expense-date'>
                {t('expenses.edit.fieldDate')}
              </FieldLabel>
              <DatePicker
                fullWidth
                aria-label={t('expenses.edit.fieldDate')}
                id='edit-expense-date'
                value={new Date(draft.occurredAt).toISOString().slice(0, 10)}
                onChange={(value) => {
                  selection()

                  const nextDate = new Date(
                    `${value}T12:00:00+07:00`,
                  ).toISOString()
                  updateDraft({ occurredAt: new Date(nextDate).getTime() })
                }}
              />
            </Field>
            <Field>
              <FieldLabel>{t('expenses.edit.fieldCategory')}</FieldLabel>
              <EditSelectRow
                label={t('expenses.edit.fieldCategory')}
                value={activeCategory.label}
                onClick={() => {
                  selection()
                  navigate(getExpenseEditCategoryPath(expenseId))
                }}>
                <TmaCategoryIconBadge
                  accent={activeCategory.accent}
                  iconUrl={activeCategory.iconUrl}
                  size='sm'
                  symbol={activeCategory.symbol}
                />
              </EditSelectRow>
            </Field>
            <Field>
              <FieldLabel id='edit-expense-source-label'>
                {t('expenses.edit.fieldSource')}
              </FieldLabel>
              <ToggleGroup
                aria-labelledby='edit-expense-source-label'
                className='grid w-full grid-cols-3 gap-2'
                id='edit-expense-source'
                value={draft.sourceKey ? [draft.sourceKey] : []}
                onValueChange={(values) => {
                  const next = values[0] as SourceKey | undefined
                  if (next) {
                    selection()
                    updateDraft({ sourceKey: next })
                  }
                }}>
                {sourcePickerOptions.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    className='min-h-11'
                    type='button'
                    value={option.value}>
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card size='sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm tracking-normal normal-case'>
            {t('expenses.edit.fieldHousehold')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className='gap-4'>
            <Field>
              <FieldLabel htmlFor='edit-expense-household-picker'>
                {t('expenses.edit.fieldHousehold')}
              </FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('expenses.edit.fieldHouseholdPlaceholder')}
                id='edit-expense-household-picker'
                options={householdPickerOptions}
                value={draft.householdId ?? ''}
                onChange={(next) => {
                  selection()
                  updateDraft({ householdId: next || null })
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='edit-expense-group-picker'>
                {t('expenses.edit.fieldGroup')}
              </FieldLabel>
              <NativePicker
                fullWidth
                aria-label={t('expenses.edit.fieldGroupPlaceholder')}
                id='edit-expense-group-picker'
                options={groupPickerOptions}
                value={draft.groupId ?? ''}
                onChange={(next) => {
                  selection()
                  updateDraft({ groupId: next || null })
                }}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </>
  )
}
