import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Eyebrow,
  Field,
  FieldLabel,
  Input,
  Textarea,
} from '@/components/ui'
import { useHouseholdsQuery } from '@/features/home/api'
import { getGroupDetailPath, TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { cn } from '@/lib/utils'

import { useCreateExpenseGroupMutation } from '../api'
import {
  parseBudgetInputToMinor,
  parseOptionalDateInput,
} from '../presentation'

type GroupPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

const PERSONAL_CONTEXT_VALUE = 'personal'

export const CreateGroupPage = () => {
  const navigate = useNavigate()
  const householdsQuery = useHouseholdsQuery()
  const createGroupMutation = useCreateExpenseGroupMutation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [budgetInput, setBudgetInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [contextValue, setContextValue] = useState(PERSONAL_CONTEXT_VALUE)
  const [feedback, setFeedback] = useState<GroupPageFeedback | null>(null)

  const adminHouseholds = useMemo(
    () =>
      (householdsQuery.data?.items ?? []).filter(
        (household) => household.role === 'admin',
      ),
    [householdsQuery.data?.items],
  )
  const isBusy = createGroupMutation.isPending
  const normalizedName = name.trim()
  const normalizedDescription = description.trim()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedStartDate = parseOptionalDateInput(startDate)
    const parsedEndDate = parseOptionalDateInput(endDate)
    const parsedBudget = parseBudgetInputToMinor(budgetInput)

    if (!normalizedName) {
      setFeedback({ message: 'Tên group không được để trống.', tone: 'error' })

      return
    }

    if (normalizedName.length > 200) {
      setFeedback({ message: 'Tên group tối đa 200 ký tự.', tone: 'error' })

      return
    }

    if (normalizedDescription.length > 1000) {
      setFeedback({ message: 'Mô tả tối đa 1000 ký tự.', tone: 'error' })

      return
    }

    if (
      parsedStartDate !== undefined &&
      parsedEndDate !== undefined &&
      parsedEndDate < parsedStartDate
    ) {
      setFeedback({
        message: 'Ngày kết thúc không được trước ngày bắt đầu.',
        tone: 'error',
      })

      return
    }

    if (parsedBudget !== undefined && parsedBudget <= 0) {
      setFeedback({ message: 'Ngân sách phải lớn hơn 0.', tone: 'error' })

      return
    }

    if (parsedBudget !== undefined && parsedBudget > 999_999_999_999) {
      setFeedback({ message: 'Ngân sách quá lớn.', tone: 'error' })

      return
    }

    try {
      const created = await createGroupMutation.mutateAsync({
        name: normalizedName,
        ...(normalizedDescription
          ? { description: normalizedDescription }
          : {}),
        ...(parsedStartDate !== undefined
          ? { startDate: parsedStartDate }
          : {}),
        ...(parsedEndDate !== undefined ? { endDate: parsedEndDate } : {}),
        ...(parsedBudget !== undefined ? { eventBudget: parsedBudget } : {}),
        ...(contextValue !== PERSONAL_CONTEXT_VALUE
          ? { householdId: contextValue }
          : {}),
      })

      navigate(getGroupDetailPath(created.id), {
        replace: true,
        state: {
          feedback: {
            message: 'Đã tạo group thành công.',
            tone: 'success',
          },
        },
      })
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : 'Không thể tạo group lúc này.',
        tone: 'error',
      })
    }
  }

  return (
    <TmaPageShell title='Tạo group'>
      <Card className='grid gap-2 p-5'>
        <Eyebrow>Thiết lập mới</Eyebrow>
        <strong className='text-2xl font-extrabold text-tma-text-strong'>
          Tạo group
        </strong>
        <CardDescription>
          Group không cần avatar. Chỉ cần tên, context và ngân sách nếu muốn
          theo dõi tiến độ chi tiêu.
        </CardDescription>
      </Card>

      {feedback ? (
        <Card
          className={
            feedback.tone === 'error'
              ? 'mt-3 border-[#d93838]/20 bg-[#ffeded]/90'
              : 'mt-3 border-tma-positive/20 bg-tma-positive/10'
          }>
          <CardDescription
            className={
              feedback.tone === 'error' ? 'text-[#d93838]' : 'text-[#2f9b44]'
            }>
            {feedback.message}
          </CardDescription>
        </Card>
      ) : null}

      <section className='mt-6'>
        <div className='mb-3'>
          <Eyebrow>Thông tin chính</Eyebrow>
          <CardTitle>Group mới</CardTitle>
        </div>

        <Card>
          <form className='grid gap-3.5' onSubmit={handleSubmit}>
            <Field>
              <FieldLabel>Tên group</FieldLabel>
              <Input
                disabled={isBusy}
                maxLength={200}
                placeholder='Ví dụ: Đà Lạt cuối tuần'
                type='text'
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setFeedback(null)
                }}
              />
            </Field>

            <Field>
              <FieldLabel>Context</FieldLabel>
              <select
                className={cn(
                  'min-h-14 w-full rounded-[18px] border border-tma-line bg-black/[0.04] px-4 text-base text-tma-text-strong transition outline-none focus:border-tma-primary/30 focus:ring-4 focus:ring-tma-primary/10 disabled:opacity-70',
                )}
                disabled={isBusy || householdsQuery.isLoading}
                value={contextValue}
                onChange={(event) => {
                  setContextValue(event.target.value)
                  setFeedback(null)
                }}>
                <option value={PERSONAL_CONTEXT_VALUE}>Cá nhân</option>
                {adminHouseholds.map((household) => (
                  <option key={household.id} value={household.id}>
                    {household.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel>Mô tả</FieldLabel>
              <Textarea
                disabled={isBusy}
                maxLength={1000}
                placeholder='Ghi chú ngắn để nhớ group này dùng cho việc gì.'
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                  setFeedback(null)
                }}
              />
            </Field>

            <div className='grid gap-3.5'>
              <Field>
                <FieldLabel>Bắt đầu</FieldLabel>
                <Input
                  disabled={isBusy}
                  type='date'
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value)
                    setFeedback(null)
                  }}
                />
              </Field>

              <Field>
                <FieldLabel>Kết thúc</FieldLabel>
                <Input
                  disabled={isBusy}
                  type='date'
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value)
                    setFeedback(null)
                  }}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Ngân sách sự kiện</FieldLabel>
              <Input
                disabled={isBusy}
                inputMode='numeric'
                placeholder='Ví dụ: 3.000.000'
                value={budgetInput}
                onChange={(event) => {
                  setBudgetInput(formatAmountInput(event.target.value))
                  setFeedback(null)
                }}
              />
            </Field>

            <CardDescription>
              Chỉ household admin mới tạo được group gắn household. Nếu không
              chọn household, group sẽ là group cá nhân.
            </CardDescription>

            <div className='flex flex-wrap justify-end gap-2.5'>
              <Button
                disabled={isBusy}
                type='button'
                variant='ghost'
                onClick={() => navigate(TMA_PATHS.groups)}>
                Hủy
              </Button>

              <Button disabled={isBusy} type='submit' variant='secondary'>
                {isBusy ? 'Đang tạo...' : 'Tạo group'}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </TmaPageShell>
  )
}
