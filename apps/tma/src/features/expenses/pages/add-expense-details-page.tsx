import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { DatePicker } from '@/components/shared/date-picker'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  TmaCategoryIconBadge,
  TmaPageFooter,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAddExpenseFlowStore } from '@/features/expenses/model/store'
import { getSourceOptions } from '@/features/expenses/presentation'
import type { SourceKey } from '@/features/home/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  currencyDisplaySymbol,
  formatAmountInput,
  formatDateLabel,
  minorFromRaw,
  parseAmountInput,
  rawFromMinor,
} from '@/lib/formatters'
import { notification, selection } from '@/lib/telegram/haptics'

export const AddExpenseDetailsPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const category = useAddExpenseFlowStore((state) => state.category)
  const draftAmount = useAddExpenseFlowStore((state) => state.amount)
  const draftSourceId = useAddExpenseFlowStore(
    (state) => state.sourceId || 'bank-transfer',
  )
  const draftTitle = useAddExpenseFlowStore((state) => state.title)
  const setDetails = useAddExpenseFlowStore((state) => state.setDetails)
  const date = useAddExpenseFlowStore((state) => state.date)
  const setDate = useAddExpenseFlowStore((state) => state.setDate)

  const [amountInput, setAmountInput] = useState(
    draftAmount > 0 ? formatAmountInput(String(rawFromMinor(draftAmount))) : '',
  )
  const [sourceId, setSourceId] = useState<SourceKey | null>(draftSourceId)
  const [title, setTitle] = useState(draftTitle)

  const amount = parseAmountInput(amountInput)
  const isValid = amount > 0 && sourceId !== null

  const handleContinue = useEffectEvent(() => {
    if (!isValid || sourceId === null) {
      return
    }

    notification('success')
    setDetails({ amount: minorFromRaw(amount), sourceId, title: title.trim() })
    navigate(TMA_PATHS.expensesNewContext)
  })

  useEffect(() => {
    amountInputRef.current?.focus({ preventScroll: true })
  }, [])

  if (!category) {
    return (
      <TmaPageShell contentClassName='gap-4' title={t('expenses.add.title')}>
        <TmaPageHeader
          eyebrow={t('expenses.add.step', { current: '2', total: '3' })}
          title={t('expenses.add.previousStepMissing')}
        />
        <Card>
          <CardHeader>
            <CardTitle>{t('expenses.add.emptyTitle')}</CardTitle>
            <CardDescription>
              {t('expenses.add.previousStepMissingDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link to={TMA_PATHS.expensesNewCategory} />}
              size='sm'
              variant='secondary'>
              {t('expenses.add.backToStep1')}
            </Button>
          </CardContent>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell
      contentClassName='gap-4'
      footer={
        <TmaPageFooter>
          <TmaHapticButton
            className='w-full'
            disabled={!isValid}
            onClick={handleContinue}>
            {t('expenses.add.continue')}
          </TmaHapticButton>
        </TmaPageFooter>
      }
      title={t('expenses.add.title')}>
      <TmaPageHeader
        eyebrow={t('expenses.add.step', { current: '2', total: '3' })}
        subtitle={formatDateLabel(date)}
        title={t('expenses.add.detailsTitle', {
          defaultValue: t('expenses.add.title'),
        })}
      />

      <Card size='sm'>
        <CardContent className='flex items-center gap-3 py-3'>
          <TmaCategoryIconBadge
            accent={category.accent}
            iconUrl={category.iconUrl}
            symbol={category.symbol}
          />
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold'>{category.label}</p>
            <p className='text-xs text-muted-foreground'>
              {formatDateLabel(date)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            {t('expenses.add.detailsTitle', {
              defaultValue: t('expenses.add.title'),
            })}
          </CardTitle>
          <CardDescription>{formatDateLabel(date)}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className='gap-5'>
            <Field>
              <FieldLabel htmlFor='add-expense-date'>
                {t('expenses.add.dateLabel')}
              </FieldLabel>
              <DatePicker
                fullWidth
                aria-label={t('expenses.add.dateLabel')}
                id='add-expense-date'
                value={date.slice(0, 10)}
                onChange={(value) => {
                  const nextDate = new Date(
                    `${value}T12:00:00+07:00`,
                  ).toISOString()
                  setDate(nextDate)
                }}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='add-expense-amount'>
                {t('expenses.edit.fieldAmount')}
              </FieldLabel>
              <div className='flex min-w-0 items-end gap-2'>
                <Input
                  ref={amountInputRef}
                  autoFocus={true}
                  className='min-w-0 flex-1 text-right font-mono text-2xl font-semibold tabular-nums sm:text-3xl'
                  id='add-expense-amount'
                  inputMode='numeric'
                  placeholder='0'
                  type='text'
                  value={amountInput}
                  onChange={(event) => {
                    setAmountInput(formatAmountInput(event.target.value))
                  }}
                />
                <span className='shrink-0 pb-1 font-mono text-xl font-semibold text-foreground/80 sm:text-2xl'>
                  .000
                </span>
                <span className='shrink-0 pb-1.5 text-xs font-semibold text-muted-foreground'>
                  {currencyDisplaySymbol('VND')}
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor='add-expense-title'>
                {t('expenses.add.nameLabel')}
              </FieldLabel>
              <Input
                id='add-expense-title'
                placeholder={t('expenses.add.namePlaceholder')}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault()
                    handleContinue()
                  }
                }}
              />
            </Field>

            <Field>
              <FieldLabel id='add-expense-source-label'>
                {t('expenses.add.source')}
              </FieldLabel>
              <ToggleGroup
                aria-labelledby='add-expense-source-label'
                className='grid w-full grid-cols-3 gap-2.5'
                value={sourceId ? [sourceId] : []}
                onValueChange={(values) => {
                  const value = values[0]
                  if (value) {
                    selection()
                    setSourceId(value as SourceKey)
                  }
                }}>
                {getSourceOptions(t).map((source) => (
                  <ToggleGroupItem
                    key={source.id}
                    className='min-h-11 px-2 text-xs leading-tight break-words whitespace-normal'
                    type='button'
                    value={source.id}>
                    {source.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
