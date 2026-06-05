import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { CoinIcon, NoteIcon, SparkIcon } from '@/components/shared/tma-icons'
import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import { expenseSources } from '@/features/finance/mock-data'
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
  const [sourceId, setSourceId] = useState<string | null>(draftSourceId)
  const [note, setNote] = useState(draftNote)

  const amount = parseAmountInput(amountInput)
  const isValid = amount > 0 && sourceId !== null

  const handleContinue = useEffectEvent(() => {
    if (!isValid || sourceId === null) {
      return
    }

    notification('success')
    setDetails({ amount, sourceId, note })
    navigate('/expenses/new/context')
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
        <section className='tma-empty-card'>
          <h2>Chưa có danh mục</h2>
          <p>
            Bắt đầu lại từ bước chọn ngày và danh mục để tiếp tục luồng này.
          </p>
          <Link className='tma-primary-link' to='/expenses/new/category'>
            Quay lại bước 1
          </Link>
        </section>
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
      <section className='tma-step-summary'>
        <TmaMonogramBadge accent={category.accent} label={category.symbol} />
        <div>
          <strong>{category.label}</strong>
          <p>{formatDateLabel(date)}</p>
        </div>
      </section>

      <section className='tma-amount-card'>
        <div className='tma-input-head'>
          <CoinIcon height='18' width='18' />
          <span>Số tiền</span>
        </div>
        <label className='tma-amount-input'>
          <input
            className='font-mono'
            inputMode='numeric'
            placeholder='0'
            type='text'
            value={amountInput}
            onChange={(event) => {
              setAmountInput(formatAmountInput(event.target.value))
            }}
          />
          <span>VND</span>
        </label>
        <p className='tma-amount-card__preview'>
          {amount > 0 ? (
            <span className='font-mono'>{formatVnd(amount)}</span>
          ) : (
            'Nhập một số tiền đủ rõ để tiếp tục.'
          )}
        </p>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Nguồn tiền</p>
            <h2 className='tma-section__title'>
              Chọn tài khoản hoặc ví dùng để chi
            </h2>
          </div>
        </div>

        <div className='tma-chip-grid'>
          {expenseSources.map((source) => (
            <button
              key={source.id}
              className={cn(
                'tma-select-chip',
                sourceId === source.id && 'bg-tma-primary/12 text-tma-primary',
              )}
              type='button'
              onClick={() => {
                selection()
                setSourceId(source.id)
              }}>
              <span>{source.label}</span>
              <small>{source.detail}</small>
            </button>
          ))}
        </div>
      </section>

      <section className='tma-note-card'>
        <div className='tma-input-head'>
          <NoteIcon height='18' width='18' />
          <span>Mô tả</span>
        </div>
        <textarea
          placeholder='Ví dụ: đi chợ cuối tuần, cafe họp nhóm...'
          rows={4}
          value={note}
          onChange={(event) => {
            setNote(event.target.value)
          }}
        />
        <div className='tma-note-card__foot'>
          <SparkIcon height='16' width='16' />
          <span>BottomButton của Telegram sẽ dùng để sang bước 3.</span>
        </div>
      </section>
    </TmaPageShell>
  )
}
