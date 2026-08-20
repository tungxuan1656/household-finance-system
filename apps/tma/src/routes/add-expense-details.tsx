import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { DatePicker } from '@/components/shared/date-picker'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  TmaCategoryIconBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
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
import { getSourceOptions } from '@/features/expenses/presentation'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import type { SourceKey } from '@/features/home/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  currencyDisplaySymbol,
  formatAmountInput,
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
      <TmaPageShell title={t('expenses.add.title')}>
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
            <TmaHapticButton size='sm' variant='secondary'>
              <Link to={TMA_PATHS.expensesNewCategory}>
                {t('expenses.add.backToStep1')}
              </Link>
            </TmaHapticButton>
          </CardContent>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('expenses.add.title')}>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <TmaCategoryIconBadge
              accent={category.accent}
              iconUrl={category.iconUrl}
              symbol={category.symbol}
            />
            <CardTitle>{category.label}</CardTitle>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.add.dateLabel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.edit.fieldAmount')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='add-expense-amount'>
                {t('expenses.edit.fieldAmount')}
              </FieldLabel>
              <div className='flex items-end gap-2'>
                <Input
                  ref={amountInputRef}
                  autoFocus={true}
                  className='text-right font-mono text-3xl font-semibold'
                  id='add-expense-amount'
                  inputMode='numeric'
                  placeholder='0'
                  type='text'
                  value={amountInput}
                  onChange={(event) => {
                    setAmountInput(formatAmountInput(event.target.value))
                  }}
                />
                <span className='font-mono text-3xl font-semibold text-foreground/80'>
                  .000
                </span>
                <span className='text-xs font-semibold text-muted-foreground'>
                  {currencyDisplaySymbol('VND')}
                </span>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.add.nameLabel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.add.source')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            className='grid w-full grid-cols-3 gap-2'
            value={sourceId ? [sourceId] : []}
            onValueChange={(values) => {
              const value = values[0]
              if (value) {
                selection()
                setSourceId(value as SourceKey)
              }
            }}>
            {getSourceOptions(t).map((source) => (
              <ToggleGroupItem key={source.id} type='button' value={source.id}>
                {source.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      <TmaHapticButton
        className='mt-5 mb-2 w-full'
        disabled={!isValid}
        onClick={handleContinue}>
        {t('expenses.add.continue')}
      </TmaHapticButton>
    </TmaPageShell>
  )
}
