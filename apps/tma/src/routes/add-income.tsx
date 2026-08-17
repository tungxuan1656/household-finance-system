import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { CoinIcon, NoteIcon, SunIcon } from '@/components/shared/tma-icons'
import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import { Button, ChipButton, Section } from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
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

      <DatePicker
        fullWidth
        aria-label={t('incomes.fieldDate')}
        className='mt-1'
        value={date}
        onChange={(value) => {
          selection()
          setDate(value)
        }}
      />

      <Section className='grid gap-1'>
        <div className='inline-flex items-center gap-2 text-sm font-bold text-muted-foreground'>
          <CoinIcon className='mt-1 size-6' />
          <span>{t('incomes.fieldAmount')}</span>
        </div>
        <label className='flex items-end justify-between gap-2 rounded-3xl bg-white p-4'>
          <input
            ref={amountInputRef}
            autoFocus={true}
            className='w-full bg-transparent text-right font-mono text-3xl leading-none font-semibold text-foreground outline-none'
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
        </label>
      </Section>

      <Section className='grid gap-1'>
        <div className='inline-flex items-center gap-2 text-sm font-bold text-muted-foreground'>
          <NoteIcon className='size-6' />
          <span>{t('incomes.fieldName')}</span>
        </div>
        <div className='rounded-3xl bg-white p-5'>
          <input
            className='w-full border-0 bg-transparent px-0 text-base font-medium text-foreground outline-none'
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
        </div>
      </Section>

      <Section className='grid gap-1'>
        <div className='inline-flex items-center gap-2 text-sm font-bold text-muted-foreground'>
          <NoteIcon className='size-6' />
          <span>{t('incomes.fieldNote')}</span>
        </div>
        <div className='rounded-3xl bg-white p-5'>
          <textarea
            className='w-full resize-none border-0 bg-transparent px-0 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/60'
            placeholder={t('incomes.notePlaceholder')}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
      </Section>

      <Section>
        <div className='inline-flex items-center gap-2 text-sm font-bold text-muted-foreground'>
          <SunIcon className='size-6' />
          <span>{t('incomes.source')}</span>
        </div>
        <div className='grid grid-cols-3 gap-2.5'>
          {getSourceOptions(t).map((source) => (
            <ChipButton
              key={source.id}
              className={sourceId === source.id ? 'ring-2 ring-green-300' : ''}
              onClick={() => {
                setSourceId(source.id)
              }}>
              <span className='font-semibold'>{source.label}</span>
            </ChipButton>
          ))}
        </div>
      </Section>

      <Button
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
      </Button>
    </TmaPageShell>
  )
}
