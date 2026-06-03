import { useEffect, useEffectEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
  TmaPageTitleBar,
} from '@/components/shared/tma-page-shell'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import {
  expenseSources,
  groupOptions,
  householdOptions,
} from '@/features/finance/mock-data'
import { formatDateLabel, formatVnd } from '@/lib/formatters'
import { hideBottomButton, setBottomButton } from '@/lib/telegram/bottom-button'
import { notification, selection } from '@/lib/telegram/haptics'

export const AddExpenseContextPage = () => {
  const navigate = useNavigate()
  const date = useAddExpenseFlowStore((state) => state.date)
  const category = useAddExpenseFlowStore((state) => state.category)
  const amount = useAddExpenseFlowStore((state) => state.amount)
  const note = useAddExpenseFlowStore((state) => state.note)
  const sourceId = useAddExpenseFlowStore((state) => state.sourceId)
  const householdId = useAddExpenseFlowStore((state) => state.householdId)
  const groupId = useAddExpenseFlowStore((state) => state.groupId)
  const setContext = useAddExpenseFlowStore((state) => state.setContext)
  const reset = useAddExpenseFlowStore((state) => state.reset)

  const selectedSource =
    expenseSources.find((source) => source.id === sourceId) ?? null
  const selectedHousehold = householdOptions.find(
    (household) => household.id === householdId,
  )
  const selectedGroup = groupOptions.find((group) => group.id === groupId)
  const isReady = category !== null && amount > 0

  const handleSave = useEffectEvent(() => {
    if (!category || amount <= 0) {
      return
    }

    notification('success')

    navigate('/expenses', {
      state: {
        savedExpense: {
          title: category.label,
          amount,
        },
      },
    })

    reset()
  })

  useEffect(() => {
    if (!isReady) {
      hideBottomButton()

      return
    }

    const cleanup = setBottomButton({
      text: `Lưu ${formatVnd(amount)}`,
      enabled: true,
      showProgress: false,
      onClick: () => {
        handleSave()
      },
    })

    return () => {
      cleanup()
      hideBottomButton()
    }
  }, [amount, handleSave, isReady])

  if (!isReady || !category) {
    return (
      <TmaPageShell
        showBackButton
        backTo='/expenses/new/details'
        showBottomTabs={false}>
        <TmaPageTitleBar title='Thêm chi tiêu' />
        <TmaPageHeader eyebrow='Bước 3/3' title='Quay lại để hoàn tất bước 2' />
        <section className='tma-empty-card'>
          <h2>Chưa có dữ liệu preview</h2>
          <p>
            Hoàn tất số tiền và nguồn tiền ở bước 2 rồi quay lại đây để chọn bối
            cảnh.
          </p>
          <Link className='tma-primary-link' to='/expenses/new/details'>
            Quay lại bước 2
          </Link>
        </section>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell
      reserveBottomButton
      showBackButton
      backTo='/expenses/new/details'
      showBottomTabs={false}>
      <TmaPageTitleBar title='Thêm chi tiêu' />
      <TmaPageHeader
        eyebrow='Bước 3/3'
        subtitle='Chọn gia đình, nhóm và xem lại toàn bộ thông tin.'
        title='Gắn đúng bối cảnh trước khi lưu'
      />
      <section className='tma-step-summary'>
        <TmaMonogramBadge accent={category.accent} label={category.symbol} />
        <div>
          <strong>{category.label}</strong>
          <p>
            {formatDateLabel(date)} • {formatVnd(amount)}
          </p>
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Gia đình</p>
            <h2 className='tma-section__title'>
              Gắn chi tiêu vào đúng ngữ cảnh
            </h2>
          </div>
        </div>

        <div className='tma-chip-grid'>
          {householdOptions.map((household) => (
            <button
              key={household.id}
              className={`tma-select-chip${householdId === household.id ? 'is-active' : ''}`}
              type='button'
              onClick={() => {
                selection()
                setContext({ householdId: household.id, groupId })
              }}>
              <span>{household.name}</span>
              <small>{household.members} thành viên</small>
            </button>
          ))}
        </div>
      </section>

      <section className='tma-section'>
        <div className='tma-section__header'>
          <div>
            <p className='tma-section-label'>Nhóm</p>
            <h2 className='tma-section__title'>
              Tuỳ chọn cho tracking chi tiết hơn
            </h2>
          </div>
        </div>

        <div className='tma-chip-grid'>
          {groupOptions.map((group) => (
            <button
              key={group.id}
              className={`tma-select-chip${groupId === group.id ? 'is-active' : ''}`}
              type='button'
              onClick={() => {
                selection()
                setContext({ householdId, groupId: group.id })
              }}>
              <span>{group.label}</span>
              <small>Nhóm chi tiêu</small>
            </button>
          ))}
        </div>
      </section>

      <section className='tma-preview-card'>
        <p className='tma-section-label'>Preview</p>
        <div className='tma-preview-card__grid'>
          <div>
            <span>Danh mục</span>
            <strong>{category.label}</strong>
          </div>
          <div>
            <span>Số tiền</span>
            <strong>{formatVnd(amount)}</strong>
          </div>
          <div>
            <span>Ngày</span>
            <strong>{formatDateLabel(date)}</strong>
          </div>
          <div>
            <span>Nguồn tiền</span>
            <strong>{selectedSource?.label ?? 'Chưa chọn'}</strong>
          </div>
          <div>
            <span>Gia đình</span>
            <strong>{selectedHousehold?.name ?? 'Không gắn'}</strong>
          </div>
          <div>
            <span>Nhóm</span>
            <strong>{selectedGroup?.label ?? 'Không gắn'}</strong>
          </div>
          <div className='is-wide'>
            <span>Ghi chú</span>
            <strong>{note || 'Không có mô tả'}</strong>
          </div>
        </div>
      </section>
    </TmaPageShell>
  )
}
