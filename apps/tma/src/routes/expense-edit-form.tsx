import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { CoinIcon, NoteIcon } from '@/components/shared/tma-icons'
import { TmaCategoryIconBadge } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  Field,
  FieldLabel,
  Input,
  NativePicker,
} from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
import type { EditExpenseDraft } from '@/features/expenses/store'
import { useEditExpenseStore } from '@/features/expenses/store'
import type { SourceKey } from '@/features/home/types'
import { getExpenseEditCategoryPath } from '@/lib/constants/routes'
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
      <Card className='mt-3 grid gap-3'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-tma-text-muted'>
          <CoinIcon height='16' width='16' />
          <span>{t('expenses.edit.fieldAmount')}</span>
        </div>
        <label className='flex items-end justify-between gap-2 rounded-3xl bg-white p-4'>
          <input
            className='w-full bg-transparent text-right font-mono text-3xl leading-none font-semibold text-tma-text-strong outline-none'
            inputMode='numeric'
            placeholder='0'
            type='text'
            value={amountInput}
            onChange={(event) => onAmountChange(event.target.value)}
          />
          <span className='font-mono text-3xl font-semibold text-tma-text-strong/80'>
            .000
          </span>
          <span className='text-xs font-semibold text-tma-text-muted'>
            {currencyCode}
          </span>
        </label>
      </Card>

      {/* Title */}
      <Card className='mt-3 grid gap-3'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-tma-text-muted'>
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
      <Card className='mt-3 overflow-hidden p-0'>
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
      <Card className='mt-3 grid gap-0 px-4'>
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
      <Card className='mt-3 grid gap-3'>
        <Field>
          <FieldLabel>{t('expenses.edit.fieldSource')}</FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldSourcePlaceholder')}
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
      <Card className='mt-3 grid gap-3'>
        <Field>
          <FieldLabel>{t('expenses.edit.fieldHousehold')}</FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldHouseholdPlaceholder')}
            disabled={isHouseholdLoading}
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
      <Card className='mt-3 grid gap-3'>
        <Field>
          <FieldLabel>{t('expenses.edit.fieldGroup')}</FieldLabel>
          <NativePicker
            fullWidth
            aria-label={t('expenses.edit.fieldGroupPlaceholder')}
            disabled={isGroupLoading}
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
        <Button
          variant='ghost'
          onClick={() => {
            selection()
            resetStore()
            navigate(-1)
          }}>
          {t('common.cancel')}
        </Button>
      </div>
    </>
  )
}
