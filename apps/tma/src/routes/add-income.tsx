import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { DatePicker } from '@/components/shared/date-picker'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getSourceOptions } from '@/features/expenses/presentation'
import type { SourceKey } from '@/features/home/types'
import { useCreateIncomeMutation } from '@/features/incomes/api'
import {
  currencyDisplaySymbol,
  formatAmountInput,
  minorFromRaw,
  parseAmountInput,
} from '@/lib/formatters'
import { notification, selection } from '@/lib/telegram/haptics'

/** Returns today's local date as YYYY-MM-DD. */
const todayLocal = (): string => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

export const AddIncomePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const createMutation = useCreateIncomeMutation()

  // Route-local state — no Zustand store
  const [amountInput, setAmountInput] = useState('')
  const [sourceId, setSourceId] = useState<SourceKey | null>('bank-transfer')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayLocal())

  const amount = parseAmountInput(amountInput)
  const isValid = amount > 0 && sourceId !== null
  const isSaving = createMutation.isPending

  const handleSave = useEffectEvent(() => {
    if (!isValid || sourceId === null || isSaving) {
      return
    }

    const cleanedTitle = title.trim()
    const cleanedNote = note.trim()

    createMutation.mutate(
      {
        amount: minorFromRaw(amount),
        sourceKey: sourceId,
        title: cleanedTitle || t('incomes.nameUnset'),
        occurredAt: new Date(`${date}T00:00:00`).getTime(),
        ...(cleanedNote ? { note: cleanedNote } : {}),
      },
      {
        onSuccess: () => {
          notification('success')
          navigate(-1)
        },
        // Error haptics handled by mutation-level onError — no duplicate here
      },
    )
  })

  useEffect(() => {
    amountInputRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <TmaPageShell title={t('incomes.addTitle')}>
      <TmaPageHeader title={t('incomes.addTitle')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('incomes.fieldDate')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='add-income-date'>
                {t('incomes.fieldDate')}
              </FieldLabel>
              <DatePicker
                fullWidth
                aria-label={t('incomes.fieldDate')}
                id='add-income-date'
                value={date}
                onChange={(value) => {
                  setDate(value)
                }}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('incomes.fieldAmount')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='add-income-amount'>
                {t('incomes.fieldAmount')}
              </FieldLabel>
              <div className='flex items-end gap-2'>
                <Input
                  ref={amountInputRef}
                  autoFocus={true}
                  className='text-right font-mono text-3xl font-semibold'
                  id='add-income-amount'
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
          <CardTitle>{t('incomes.fieldName')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='add-income-title'>
                {t('incomes.fieldName')}
              </FieldLabel>
              <Input
                id='add-income-title'
                placeholder={t('incomes.namePlaceholder')}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault()
                    handleSave()
                  }
                }}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('incomes.fieldNote')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='add-income-note'>
                {t('incomes.fieldNote')}
              </FieldLabel>
              <Textarea
                id='add-income-note'
                placeholder={t('incomes.notePlaceholder')}
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('incomes.source')}</CardTitle>
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
        aria-busy={isSaving}
        className='mt-5 mb-2 w-full'
        disabled={!isValid || isSaving}
        onClick={handleSave}>
        {isSaving
          ? t('incomes.saving')
          : amount > 0
            ? t('incomes.saveWithAmount', {
                amount: formatAmountInput(String(amount)),
              })
            : t('incomes.saveAction')}
      </TmaHapticButton>
    </TmaPageShell>
  )
}
