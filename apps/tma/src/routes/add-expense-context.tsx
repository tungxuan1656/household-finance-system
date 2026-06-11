import { useEffectEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  TmaCategoryIconBadge,
  TmaPageHeader,
  TmaPageShell,
} from '@/components/shared/tma-page-shell'
import {
  Button,
  buttonVariants,
  Card,
  CardDescription,
  CardTitle,
  ChipButton,
  Eyebrow,
  MoneyLabel,
  Section,
  SectionHeader,
} from '@/components/ui'
import { useCreateExpenseMutation } from '@/features/expenses/api'
import { getSourceOptions } from '@/features/expenses/presentation'
import { useAddExpenseFlowStore } from '@/features/expenses/store'
import {
  useHouseholdExpenseGroupQueries,
  usePersonalExpenseGroupListQuery,
} from '@/features/groups/api'
import { getGroupContextLabel } from '@/features/groups/presentation'
import type { GroupListItem } from '@/features/groups/types'
import { useHouseholdsQuery } from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatDateLabel, formatVnd } from '@/lib/formatters'
import { notification, selection } from '@/lib/telegram/haptics'

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className='grid gap-1'>
    <span className='text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'>
      {label}
    </span>
    <strong className='text-sm text-tma-text-strong'>{value}</strong>
  </div>
)

export const AddExpenseContextPage = () => {
  const navigate = useNavigate()
  const date = useAddExpenseFlowStore((state) => state.date)
  const category = useAddExpenseFlowStore((state) => state.category)
  const amount = useAddExpenseFlowStore((state) => state.amount)
  const title = useAddExpenseFlowStore((state) => state.title)
  const sourceId = useAddExpenseFlowStore((state) => state.sourceId)
  const householdId = useAddExpenseFlowStore((state) => state.householdId)
  const groupId = useAddExpenseFlowStore((state) => state.groupId)
  const setContext = useAddExpenseFlowStore((state) => state.setContext)
  const reset = useAddExpenseFlowStore((state) => state.reset)
  const householdsQuery = useHouseholdsQuery()
  const personalGroupsQuery = usePersonalExpenseGroupListQuery()
  const createExpenseMutation = useCreateExpenseMutation()
  const [feedback, setFeedback] = useState<string | null>(null)

  const households = householdsQuery.data?.items ?? []
  const householdGroupQueries = useHouseholdExpenseGroupQueries(households)

  const groupItems = useMemo<GroupListItem[]>(() => {
    const personalGroups = personalGroupsQuery.data?.items ?? []

    return [
      ...personalGroups.map((group) => ({ group, household: null })),
      ...households.flatMap((household, index) => {
        const query = householdGroupQueries[index]
        const groups = query?.data?.items ?? []

        return groups.map((group) => ({ group, household }))
      }),
    ].sort((left, right) => right.group.createdAt - left.group.createdAt)
  }, [householdGroupQueries, households, personalGroupsQuery.data?.items])

  const selectedSource =
    getSourceOptions().find((source) => source.id === sourceId) ?? null
  const selectedHousehold = households.find(
    (household) => household.id === householdId,
  )
  const selectedGroupItem =
    groupItems.find((item) => item.group.id === groupId) ?? null
  const isReady = category !== null && amount > 0 && sourceId !== null

  const handleSave = useEffectEvent(async () => {
    if (!category || amount <= 0 || !sourceId) {
      return
    }

    try {
      setFeedback(null)

      await createExpenseMutation.mutateAsync({
        amount,
        categoryKey: category.id,
        sourceKey: sourceId,
        title: title.trim(),
        occurredAt: new Date(date).getTime(),
        ...(householdId ? { householdId } : {}),
        ...(groupId ? { groupIds: [groupId] } : {}),
      })

      notification('success')
      reset()
      // Pop the 3 add-flow steps from history, then replace the origin with
      // home so back from the landing screen does not reopen the form.
      navigate(-3)
      navigate(TMA_PATHS.root, { replace: true })
    } catch (error) {
      notification('error')

      setFeedback(
        error instanceof Error
          ? error.message
          : 'Không thể lưu chi tiêu lúc này.',
      )
    }
  })

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
            to={TMA_PATHS.expensesNewDetails}>
            Quay lại bước 2
          </Link>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell
      reserveBottomButton
      bottomAction={
        <Button
          className='w-full'
          disabled={createExpenseMutation.isPending}
          onClick={() => {
            void handleSave()
          }}>
          {createExpenseMutation.isPending ? 'Đang lưu...' : 'Lưu chi tiêu'}
        </Button>
      }
      title='Thêm chi tiêu'>
      {feedback ? (
        <Card className='mb-3 border-[#d93838]/20 bg-[#ffeded]/90'>
          <CardDescription className='text-[#d93838]'>
            {feedback}
          </CardDescription>
        </Card>
      ) : null}

      <Card className='mb-3 grid gap-3 p-3.5'>
        <div className='flex items-center gap-3'>
          <TmaCategoryIconBadge
            accent={category.accent}
            iconUrl={category.iconUrl}
            symbol={category.symbol}
          />
          <div className='min-w-0 flex-1'>
            <CardTitle className='truncate'>{category.label}</CardTitle>
            <CardDescription>
              {formatDateLabel(date)} ·{' '}
              <MoneyLabel>{formatVnd(amount)}</MoneyLabel>
            </CardDescription>
          </div>
        </div>

        <div className='grid gap-2.5 border-t border-tma-line pt-3'>
          <div className='grid gap-1'>
            <Eyebrow>Tên khoản chi</Eyebrow>
            <strong className='truncate text-base font-semibold text-tma-text-strong'>
              {title.trim() || 'Chưa đặt tên'}
            </strong>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <SummaryRow
              label='Nguồn tiền'
              value={selectedSource?.label ?? 'Chưa chọn'}
            />
            <SummaryRow
              label='Gia đình'
              value={selectedHousehold?.name ?? 'Cá nhân'}
            />
            <SummaryRow
              label='Nhóm'
              value={
                selectedGroupItem
                  ? selectedGroupItem.group.name
                  : 'Không gắn nhóm'
              }
            />
            <SummaryRow
              label='Ngữ cảnh nhóm'
              value={
                selectedGroupItem
                  ? getGroupContextLabel(selectedGroupItem)
                  : 'Cá nhân'
              }
            />
          </div>
        </div>
      </Card>

      <Section>
        <SectionHeader title='Gia đình' />
        <div className='grid grid-cols-3 gap-2.5'>
          <ChipButton
            className={
              householdId === null ? 'bg-tma-primary/12 text-tma-primary' : ''
            }
            onClick={() => {
              selection()
              setContext({ householdId: null, groupId })
            }}>
            <span className='font-semibold'>Cá nhân</span>
          </ChipButton>
          {households.map((household) => (
            <ChipButton
              key={household.id}
              className={
                householdId === household.id
                  ? 'bg-tma-primary/12 text-tma-primary'
                  : ''
              }
              onClick={() => {
                selection()
                setContext({ householdId: household.id, groupId: null })
              }}>
              <span className='font-semibold'>{household.name}</span>
            </ChipButton>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader title='Nhóm' />
        <div className='grid grid-cols-2 gap-2.5'>
          <ChipButton
            className={
              groupId === null ? 'bg-tma-primary/12 text-tma-primary' : ''
            }
            onClick={() => {
              selection()
              setContext({ householdId, groupId: null })
            }}>
            <span className='font-semibold'>Không gắn nhóm</span>
          </ChipButton>
          {groupItems.map((item) => (
            <ChipButton
              key={item.group.id}
              className={
                groupId === item.group.id
                  ? 'bg-tma-primary/12 text-tma-primary'
                  : ''
              }
              onClick={() => {
                selection()
                setContext({ householdId, groupId: item.group.id })
              }}>
              <span className='font-semibold'>{item.group.name}</span>
            </ChipButton>
          ))}
        </div>
      </Section>
    </TmaPageShell>
  )
}
