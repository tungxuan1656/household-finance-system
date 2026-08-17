import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DatePicker } from '@/components/shared/date-picker'
import { NativePicker } from '@/components/shared/native-picker'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { CoinIcon, NoteIcon } from '@/components/shared/tma-icons'
import { TmaCategoryIconBadge } from '@/components/shared/tma-page-shell'
import { Card } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { EditExpenseDraft } from '@/features/expenses/store'
import { useEditExpenseStore } from '@/features/expenses/store'
import type { SourceKey } from '@/features/home/types'
import { getExpenseEditCategoryPath } from '@/lib/constants/routes'
import { currencyDisplaySymbol } from '@/lib/formatters'
import { selection } from '@/lib/telegram/haptics'
import { EditSelectRow } from '@/routes/expense-edit-select-row'

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
  isHouseholdLoading: boolean
  isGroupLoading: boolean
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
  isHouseholdLoading,
  isGroupLoading,
}: ExpenseEditFormProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const updateDraft = useEditExpenseStore((state) => state.updateDraft)
  const resetStore = useEditExpenseStore((state) => state.reset)

  return (
    <>
      {/* Money input */}
      <Card className='mt-3 grid gap-3 p-4'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-muted-foreground'>
          <CoinIcon height='16' width='16' />
          <span>{t('expenses.edit.fieldAmount')}</span>
        </div>
        <label className='flex items-end justify-between gap-2 rounded-3xl bg-white p-4'>
          <input
            className='w-full bg-transparent text-right font-mono text-3xl leading-none font-semibold text-foreground outline-none'
            inputMode='numeric'
            placeholder='0'
            type='text'
            value={amountInput}
            onChange={(event) => onAmountChange(event.target.value)}
          />
          <span className='font-mono text-3xl font-semibold text-foreground/80'>
            .000
          </span>
          <span className='text-xs font-semibold text-muted-foreground'>
            {currencyDisplaySymbol(currencyCode)}
          </span>
        </label>
      </Card>

      {/* Title */}
      <Card className='mt-3 grid gap-3 p-4'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-muted-foreground'>
          <NoteIcon height='16' width='16' />
          <span>{t('expenses.edit.fieldName')}</span>
        </div>
        <Input
          className='border-0 bg-transparent px-0 text-base font-semibold'
          placeholder={t('expenses.edit.fieldNamePlaceholder')}
          value={draft.title}
          onChange={(event) => updateDraft({ title: event.target.value })}
        />
      </Card>

      {/* Date */}
      <Card className='mt-3 overflow-hidden px-4'>
        <DatePicker
          fullWidth
          aria-label={t('expenses.edit.fieldDate')}
          value={new Date(draft.occurredAt).toISOString().slice(0, 10)}
          onChange={(value) => {
            selection()

            const nextDate = new Date(`${value}T12:00:00+07:00`).toISOString()
            updateDraft({ occurredAt: new Date(nextDate).getTime() })
          }}
        />
      </Card>

      {/* Category */}
      <Card className='mt-3 grid gap-0 p-4'>
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
      </Card>

      {/* Source */}
      <Card className='mt-3 grid gap-3 p-4'>
        <Field>
          <FieldLabel htmlFor='expense-source-picker'>
            {t('expenses.edit.fieldSource')}
          </FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldSourcePlaceholder')}
            id='expense-source-picker'
            options={sourcePickerOptions}
            value={draft.sourceKey}
            onChange={(next) => {
              selection()
              updateDraft({ sourceKey: next as SourceKey })
            }}
          />
        </Field>
      </Card>

      {/* Household */}
      <Card className='mt-3 grid gap-3 p-4'>
        <Field>
          <FieldLabel htmlFor='expense-household-picker'>
            {t('expenses.edit.fieldHousehold')}
          </FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldHouseholdPlaceholder')}
            disabled={isHouseholdLoading}
            id='expense-household-picker'
            options={householdPickerOptions}
            value={draft.householdId ?? ''}
            onChange={(next) => {
              selection()
              updateDraft({ householdId: next || null })
            }}
          />
        </Field>
      </Card>

      {/* Group */}
      <Card className='mt-3 grid gap-3 p-4'>
        <Field>
          <FieldLabel htmlFor='expense-group-picker'>
            {t('expenses.edit.fieldGroup')}
          </FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldGroupPlaceholder')}
            disabled={isGroupLoading}
            id='expense-group-picker'
            options={groupPickerOptions}
            value={draft.groupId ?? ''}
            onChange={(next) => {
              selection()
              updateDraft({ groupId: next || null })
            }}
          />
        </Field>
      </Card>

      {/* Cancel */}
      <div className='mt-5 grid'>
        <TmaHapticButton
          variant='ghost'
          onClick={() => {
            resetStore()
            navigate(-1)
          }}>
          {t('common.cancel')}
        </TmaHapticButton>
      </div>
    </>
  )
}
