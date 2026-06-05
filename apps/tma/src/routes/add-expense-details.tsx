import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { CoinIcon, NoteIcon, SparkIcon } from '@/components/shared/tma-icons'
import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  buttonVariants,
  Card,
  CardDescription,
  CardTitle,
  MoneyLabel,
  Section,
  SectionHeader,
  Textarea,
} from '@/components/ui'
import { getSourceOptions } from '@/features/expenses/presentation'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import type { SourceKey } from '@/features/home/types'
import { TMA_PATHS } from '@/lib/constants/routes'
import {
  formatAmountInput,
  formatDateLabel,
  formatVnd,
  parseAmountInput,
} from '@/lib/formatters'
import { hideBottomButton, setBottomButton } from '@/lib/telegram/bottom-button'
import { notification, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

export const AddExpenseDetailsPage = () => {
  const navigate = useNavigate()
  const date = useAddExpenseFlowStore((state) => state.date)
  const category = useAddExpenseFlowStore((state) => state.category)
  const draftAmount = useAddExpenseFlowStore((state) => state.amount)
  const draftSourceId = useAddExpenseFlowStore((state) => state.sourceId)
  const draftNote = useAddExpenseFlowStore((state) => state.note)
  const setDetails = useAddExpenseFlowStore((state) => state.setDetails)

  const [amountInput, setAmountInput] = useState(
    draftAmount > 0 ? formatAmountInput(String(draftAmount)) : '',
  )
  const [sourceId, setSourceId] = useState<SourceKey | null>(draftSourceId)
  const [note, setNote] = useState(draftNote)

  const amount = parseAmountInput(amountInput)
  const isValid = amount > 0 && sourceId !== null

  const handleContinue = useEffectEvent(() => {
    if (!isValid || sourceId === null) {
      return
    }

    notification('success')
    setDetails({ amount, sourceId, note })
    navigate(TMA_PATHS.expensesNewContext)
  })

  useEffect(() => {
    if (!category) {
      hideBottomButton()

      return
    }

    const cleanup = setBottomButton({
      text: 'Tiếp tục',
      enabled: isValid,
      showProgress: false,
      onClick: () => {
        handleContinue()
      },
    })

    return () => {
      cleanup()
      hideBottomButton()
    }
  }, [category, isValid])

  if (!category) {
    return (
      <TmaPageShell title='Thêm chi tiêu'>
        <TmaPageHeader eyebrow='Bước 2/3' title='Thiếu dữ liệu bước trước' />
        <Card className='grid gap-3'>
          <CardTitle>Chưa có danh mục</CardTitle>
          <CardDescription>
            Bắt đầu lại từ bước chọn ngày và danh mục để tiếp tục luồng này.
          </CardDescription>
          <Link
            className={buttonVariants({ className: 'justify-self-start' })}
            to={TMA_PATHS.expensesNewCategory}>
            Quay lại bước 1
          </Link>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell reserveBottomButton title='Thêm chi tiêu'>
      <TmaPageHeader
        eyebrow='Bước 2/3'
        subtitle='Nhập số tiền, nguồn tiền và mô tả.'
        title='Số tiền là trọng tâm ở bước này'
      />
      <Card className='mb-3 flex items-center gap-3'>
        <TmaMonogramBadge accent={category.accent} label={category.symbol} />
        <div>
          <strong className='text-tma-text-strong'>{category.label}</strong>
          <CardDescription>{formatDateLabel(date)}</CardDescription>
        </div>
      </Card>

      <Card className='grid gap-3'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-tma-text-muted'>
          <CoinIcon height='18' width='18' />
          <span>Số tiền</span>
        </div>
        <label className='flex items-end justify-between gap-2 rounded-[20px] bg-black/[0.04] p-4'>
          <input
            className='w-full bg-transparent font-mono text-[34px] leading-none font-extrabold text-tma-text-strong outline-none'
            inputMode='numeric'
            placeholder='0'
            type='text'
            value={amountInput}
            onChange={(event) => {
              setAmountInput(formatAmountInput(event.target.value))
            }}
          />
          <span className='text-xs font-semibold text-tma-text-muted'>VND</span>
        </label>
        <CardDescription>
          {amount > 0 ? (
            <MoneyLabel>{formatVnd(amount)}</MoneyLabel>
          ) : (
            'Nhập một số tiền đủ rõ để tiếp tục.'
          )}
        </CardDescription>
      </Card>

      <Section>
        <SectionHeader
          eyebrow='Nguồn tiền'
          title='Chọn tài khoản hoặc ví dùng để chi'
        />
        <div className='grid gap-2.5'>
          {getSourceOptions().map((source) => (
            <button
              key={source.id}
              className={cn(
                'grid justify-items-start gap-1 rounded-2xl bg-black/[0.04] px-3.5 py-3 text-left shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)] transition active:scale-[0.99]',
                sourceId === source.id && 'bg-tma-primary/12 text-tma-primary',
              )}
              type='button'
              onClick={() => {
                selection()
                setSourceId(source.id)
              }}>
              <span className='font-semibold'>{source.label}</span>
              <small className='text-xs text-tma-text-muted'>
                {source.detail}
              </small>
            </button>
          ))}
        </div>
      </Section>

      <Card className='mt-6 grid gap-3'>
        <div className='inline-flex items-center gap-2 text-xs font-bold text-tma-text-muted'>
          <NoteIcon height='18' width='18' />
          <span>Mô tả</span>
        </div>
        <Textarea
          placeholder='Ví dụ: đi chợ cuối tuần, cafe họp nhóm...'
          rows={4}
          value={note}
          onChange={(event) => {
            setNote(event.target.value)
          }}
        />
        <CardDescription className='inline-flex items-center gap-2'>
          <SparkIcon height='16' width='16' />
          <span>BottomButton của Telegram sẽ dùng để sang bước 3.</span>
        </CardDescription>
      </Card>
    </TmaPageShell>
  )
}
