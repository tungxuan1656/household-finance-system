import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  TmaMonogramBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Button,
  buttonVariants,
  Card,
  CardDescription,
  CardTitle,
  Chip,
  Eyebrow,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import { useCreateExpenseMutation } from '@/features/expenses/api'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import { expenseSources } from '@/features/finance/mock-data'
import { useHouseholdsQuery } from '@/features/home/api'
import { formatDateLabel, formatVnd } from '@/lib/formatters'
import { hideBottomButton, setBottomButton } from '@/lib/telegram/bottom-button'
import { notification, selection } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

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
  const householdsQuery = useHouseholdsQuery()
  const createExpenseMutation = useCreateExpenseMutation()
  const [feedback, setFeedback] = useState<string | null>(null)

  const households = householdsQuery.data?.items ?? []
  const selectedSource =
    expenseSources.find((source) => source.id === sourceId) ?? null
  const selectedHousehold = households.find(
    (household) => household.id === householdId,
  )
  const isReady = category !== null && amount > 0 && sourceId !== null

  const handleSave = useEffectEvent(async () => {
    if (!category || amount <= 0 || !sourceId) {
      return
    }

    try {
      setFeedback(null)

      const created = await createExpenseMutation.mutateAsync({
        amount,
        categoryKey: category.id,
        sourceKey: sourceId,
        title: category.label,
        occurredAt: new Date(date).getTime(),
        ...(note.trim() ? { note: note.trim() } : {}),
        ...(householdId ? { householdId } : {}),
      })

      notification('success')
      reset()
      navigate(`/expenses/${created.id}`, { replace: true })
    } catch (error) {
      notification('error')

      setFeedback(
        error instanceof Error
          ? error.message
          : 'Không thể lưu chi tiêu lúc này.',
      )
    }
  })

  useEffect(() => {
    if (!isReady) {
      hideBottomButton()

      return
    }

    const cleanup = setBottomButton({
      text: createExpenseMutation.isPending
        ? 'Đang lưu...'
        : `Lưu ${formatVnd(amount)}`,
      enabled: !createExpenseMutation.isPending,
      showProgress: createExpenseMutation.isPending,
      onClick: () => {
        void handleSave()
      },
    })

    return () => {
      cleanup()
      hideBottomButton()
    }
  }, [amount, createExpenseMutation.isPending, isReady])

  if (!isReady || !category) {
    return (
      <TmaPageShell title='Thêm chi tiêu'>
        <TmaPageHeader eyebrow='Bước 3/3' title='Quay lại để hoàn tất bước 2' />
        <Card className='grid gap-3'>
          <CardTitle>Chưa có dữ liệu preview</CardTitle>
          <CardDescription>
            Hoàn tất số tiền và nguồn tiền ở bước 2 rồi quay lại đây để chọn bối
            cảnh.
          </CardDescription>
          <Link
            className={buttonVariants({ className: 'justify-self-start' })}
            to='/expenses/new/details'>
            Quay lại bước 2
          </Link>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell reserveBottomButton title='Thêm chi tiêu'>
      <TmaPageHeader
        eyebrow='Bước 3/3'
        subtitle='Chọn gia đình và xem lại toàn bộ thông tin.'
        title='Gắn đúng bối cảnh trước khi lưu'
      />
      {feedback ? (
        <Card className='mb-3 border-[#d93838]/20 bg-[#ffeded]/90'>
          <CardDescription className='text-[#d93838]'>
            {feedback}
          </CardDescription>
        </Card>
      ) : null}

      <Card className='mb-3 flex items-center gap-3'>
        <TmaMonogramBadge accent={category.accent} label={category.symbol} />
        <div>
          <strong className='text-tma-text-strong'>{category.label}</strong>
          <CardDescription>
            {formatDateLabel(date)} ·{' '}
            <MoneyLabel>{formatVnd(amount)}</MoneyLabel>
          </CardDescription>
        </div>
      </Card>

      <Section>
        <SectionHeader
          eyebrow='Gia đình'
          title='Gắn chi tiêu vào đúng ngữ cảnh'
        />
        <div className='grid gap-2.5'>
          <button
            className={cn(
              'grid justify-items-start gap-1 rounded-2xl bg-black/[0.04] px-3.5 py-3 text-left shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)] transition active:scale-[0.99]',
              householdId === null && 'bg-tma-primary/12 text-tma-primary',
            )}
            type='button'
            onClick={() => {
              selection()
              setContext({ householdId: null, groupId })
            }}>
            <span className='font-semibold'>Cá nhân</span>
            <small className='text-xs text-tma-text-muted'>
              Không gắn household
            </small>
          </button>
          {households.map((household) => (
            <button
              key={household.id}
              className={cn(
                'grid justify-items-start gap-1 rounded-2xl bg-black/[0.04] px-3.5 py-3 text-left shadow-[inset_0_0_0_1px_rgba(17,24,39,0.04)] transition active:scale-[0.99]',
                householdId === household.id &&
                  'bg-tma-primary/12 text-tma-primary',
              )}
              type='button'
              onClick={() => {
                selection()
                setContext({ householdId: household.id, groupId: null })
              }}>
              <span className='font-semibold'>{household.name}</span>
              <small className='text-xs text-tma-text-muted'>
                {household.defaultCurrencyCode}
              </small>
            </button>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow='Nhóm'
          title='Sẽ dùng khi TMA group picker sẵn sàng'
        />
        <Card className='flex items-center justify-between gap-3'>
          <CardDescription>
            Chi tiêu này sẽ lưu không gắn nhóm để tránh dùng dữ liệu nhóm giả.
          </CardDescription>
          <Chip tone='warning'>Sớm có</Chip>
        </Card>
      </Section>

      <Card className='mt-6 grid gap-4'>
        <Eyebrow>Preview</Eyebrow>
        <div className='grid grid-cols-2 gap-x-3 gap-y-4'>
          {[
            ['Danh mục', category.label],
            ['Số tiền', formatVnd(amount)],
            ['Ngày', formatDateLabel(date)],
            ['Nguồn tiền', selectedSource?.label ?? 'Chưa chọn'],
            ['Gia đình', selectedHousehold?.name ?? 'Không gắn'],
            ['Nhóm', 'Không gắn'],
          ].map(([label, value]) => (
            <div key={label} className='grid gap-1'>
              <span className='text-xs text-tma-text-muted'>{label}</span>
              <strong className='text-sm text-tma-text-strong'>{value}</strong>
            </div>
          ))}
          <div className='col-span-2 grid gap-1'>
            <span className='text-xs text-tma-text-muted'>Ghi chú</span>
            <strong className='text-sm text-tma-text-strong'>
              {note || 'Không có mô tả'}
            </strong>
          </div>
        </div>
        <Button
          className='md:hidden'
          disabled={createExpenseMutation.isPending}
          onClick={() => {
            void handleSave()
          }}>
          {createExpenseMutation.isPending ? 'Đang lưu...' : 'Lưu chi tiêu'}
        </Button>
      </Card>
    </TmaPageShell>
  )
}
