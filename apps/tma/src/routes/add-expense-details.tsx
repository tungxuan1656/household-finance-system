import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { CoinIcon, NoteIcon, SunIcon } from '@/components/shared/tma-icons'
import {
  TmaCategoryIconBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  buttonVariants,
  Card,
  CardDescription,
  CardTitle,
  ChipButton,
  Section,
} from '@/components/ui'
import { DatePicker } from '@/components/ui/date-picker'
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
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'
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
  const hasCategory = category !== null

  const handleContinue = useEffectEvent(() => {
    if (!isValid || sourceId === null) {
      return
    }

    notification('success')
    setDetails({ amount: minorFromRaw(amount), sourceId, title: title.trim() })
    navigate(TMA_PATHS.expensesNewContext)
  })

  useEffect(() => {
    if (!hasCategory) {
      return
    }

    const cleanup = setBottomButton({
      text: t('expenses.add.continue'),
      enabled: false,
      showProgress: false,
      onClick: () => {
        handleContinue()
      },
    })

    return cleanup
  }, [hasCategory, t])

  useEffect(() => {
    if (!hasCategory) {
      return
    }

    updateBottomButton({
      text: t('expenses.add.continue'),
      enabled: isValid,
      showProgress: false,
    })
  }, [hasCategory, isValid])

  useEffect(() => {
    amountInputRef.current?.focus({ preventScroll: true })

    return () => {
      hideBottomButton()
    }
  }, [])

  if (!category) {
    return (
      <TmaPageShell title={t('expenses.add.title')}>
        <TmaPageHeader
          eyebrow={t('expenses.add.step', { current: '2', total: '3' })}
          title={t('expenses.add.previousStepMissing')}
        />
        <Card className='grid gap-3'>
          <CardTitle>{t('expenses.add.emptyTitle')}</CardTitle>
          <CardDescription>
            {t('expenses.add.previousStepMissingDesc')}
          </CardDescription>
          <Link
            className={buttonVariants({ className: 'justify-self-start' })}
            to={TMA_PATHS.expensesNewCategory}>
            {t('expenses.add.backToStep1')}
          </Link>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell reserveBottomButton title={t('expenses.add.title')}>
      <Card className='mt-2 mb-3 flex items-center gap-3 p-2.5'>
        <TmaCategoryIconBadge
          accent={category.accent}
          iconUrl={category.iconUrl}
          symbol={category.symbol}
        />
        <div>
          <CardTitle>{category.label}</CardTitle>
        </div>
      </Card>

      <DatePicker
        fullWidth
        aria-label={t('expenses.add.dateLabel')}
        className='mt-1'
        value={date.slice(0, 10)}
        onChange={(value) => {
          selection()

          const nextDate = new Date(`${value}T12:00:00+07:00`).toISOString()
          setDate(nextDate)
        }}
      />

      <Section className='grid gap-1'>
        <div className='inline-flex items-center gap-2 text-sm font-bold text-tma-text-muted'>
          <CoinIcon className='mt-1 size-6' />
          <span>{t('expenses.edit.fieldAmount')}</span>
        </div>
        <label className='flex items-end justify-between gap-2 rounded-3xl bg-white p-4'>
          <input
            ref={amountInputRef}
            autoFocus={true}
            className='w-full bg-transparent text-right font-mono text-3xl leading-none font-semibold text-tma-text-strong outline-none'
            inputMode='numeric'
            placeholder='0'
            type='text'
            value={amountInput}
            onChange={(event) => {
              setAmountInput(formatAmountInput(event.target.value))
            }}
          />
          <span className='font-mono text-3xl font-semibold text-tma-text-strong/80'>
            .000
          </span>
          <span className='text-xs font-semibold text-tma-text-muted'>
            {currencyDisplaySymbol('VND')}
          </span>
        </label>
      </Section>

      <Section className='grid gap-1'>
        <div className='inline-flex items-center gap-2 text-sm font-bold text-tma-text-muted'>
          <NoteIcon className='size-6' />
          <span>{t('expenses.add.nameLabel')}</span>
        </div>
        <div className='rounded-3xl bg-white p-5'>
          <input
            className='w-full border-0 bg-transparent px-0 text-base font-medium text-tma-text-strong outline-none'
            placeholder={t('expenses.add.namePlaceholder')}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
      </Section>

      <Section>
        <div className='inline-flex items-center gap-2 text-sm font-bold text-tma-text-muted'>
          <SunIcon className='size-6' />
          <span>{t('expenses.add.source')}</span>
        </div>
        <div className='grid grid-cols-3 gap-2.5'>
          {getSourceOptions(t).map((source) => (
            <ChipButton
              key={source.id}
              className={sourceId === source.id ? 'ring-2 ring-blue-300' : ''}
              onClick={() => {
                selection()
                setSourceId(source.id)
              }}>
              <span className='font-semibold'>{source.label}</span>
            </ChipButton>
          ))}
        </div>
      </Section>
    </TmaPageShell>
  )
}
