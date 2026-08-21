import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/features/auth/store'
import { useHouseholdsQuery } from '@/features/home/api'
import { TMA_PATHS } from '@/lib/constants/routes'
import { formatAmountInput } from '@/lib/formatters'
import { impact } from '@/lib/telegram/haptics'

import {
  useBudgetDetailQuery,
  useBudgetStatusQuery,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '../api'
import { BudgetHeroCard } from '../components/budget-hero-card'
import { BudgetProgressSection } from '../components/budget-progress-section'
import {
  type BudgetMutationFormValues,
  buildBudgetMutationRequest,
  getBudgetProgress,
  parseBudgetAmountInputToMinor,
} from '../presentation'
import type { BudgetDTO, BudgetFeedback, BudgetStatusDTO } from '../types'

// ── dumb components (no outer margin, parent gap owns spacing) ──

function BudgetFeedbackCard({ feedback }: { feedback: BudgetFeedback }) {
  return (
    <Card size='sm'>
      <CardHeader>
        <CardDescription
          className={
            feedback.tone === 'error' ? 'text-destructive' : 'text-emerald-600'
          }>
          {feedback.message}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function BudgetStatusBlock({
  statusQuery,
  t,
}: {
  statusQuery: ReturnType<typeof useBudgetStatusQuery>
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <QueryState
      error={{
        title: t('budgets.detail.loadError'),
        description: t('budgets.detail.loadErrorDesc'),
      }}
      isEmpty={(data: BudgetStatusDTO) => !data}
      pending={{
        title: t('budgets.detail.loading'),
        description: t('budgets.detail.loadingDesc'),
      }}
      query={statusQuery}
      retryAction={() => void statusQuery.refetch()}
      variant='card'>
      {(status: BudgetStatusDTO) => {
        const progress = getBudgetProgress(
          status.totalActualMinor,
          status.totalPlannedMinor,
        )
        const isOver = status.totalRemainingMinor < 0

        return (
          <BudgetProgressSection
            isOver={isOver}
            progress={progress}
            status={status}
            t={t}
          />
        )
      }}
    </QueryState>
  )
}

function BudgetManageCard({
  isEditing,
  totalLimitInput,
  onTotalLimitChange,
  onSubmit,
  onStartEdit,
  onCancelEdit,
  onDelete,
  isUpdatePending,
  isDeletePending,
  t,
}: {
  isEditing: boolean
  totalLimitInput: string
  onTotalLimitChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  isUpdatePending: boolean
  isDeletePending: boolean
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle>{t('budgets.detail.sectionManage')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* form owns its own gap; footer handles edit CTAs when isEditing */}
        <form className='grid gap-4' id='budget-edit-form' onSubmit={onSubmit}>
          <FieldGroup className='gap-4'>
            <Field>
              <FieldLabel htmlFor='budget-detail-limit'>
                {t('budgets.detail.manageLimit')}
              </FieldLabel>
              <Input
                disabled={!isEditing || isUpdatePending}
                id='budget-detail-limit'
                inputMode='numeric'
                value={totalLimitInput}
                onChange={(event) =>
                  onTotalLimitChange(formatAmountInput(event.target.value))
                }
              />
            </Field>
          </FieldGroup>

          {/* Non-editing row stays inside card for thumb reach without footer */}
          {!isEditing ? (
            <div className='flex justify-end gap-2'>
              <TmaHapticButton
                type='button'
                variant='secondary'
                onClick={onStartEdit}>
                {t('budgets.detail.editAction')}
              </TmaHapticButton>
              <TmaHapticButton
                aria-busy={isDeletePending}
                disabled={isDeletePending}
                type='button'
                variant='destructive'
                onClick={onDelete}>
                {isDeletePending
                  ? t('budgets.detail.deleting')
                  : t('budgets.detail.deleteAction')}
              </TmaHapticButton>
            </div>
          ) : (
            /* Mobile editing: keep a lightweight inline cancel for non-footer fallback; footer is primary */
            <div className='hidden'>
              <TmaHapticButton
                type='button'
                variant='secondary'
                onClick={onCancelEdit}>
                {t('common.cancel')}
              </TmaHapticButton>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// ── page ─────────────────────────────────────────────────────────

export const BudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const currentUserId = useAuthStore((state) => state.user?.id ?? null)

  const detailQuery = useBudgetDetailQuery(id ?? '')
  const statusQuery = useBudgetStatusQuery(id ?? '')
  const householdsQuery = useHouseholdsQuery()
  const updateMutation = useUpdateBudgetMutation()
  const deleteMutation = useDeleteBudgetMutation()

  const budget = detailQuery.data
  const status = statusQuery.data
  const households = householdsQuery.data?.items ?? []
  const household = useMemo(
    () => households.find((entry) => entry.id === budget?.householdId) ?? null,
    [households, budget?.householdId],
  )

  const [feedback, setFeedback] = useState<BudgetFeedback | null>(
    () =>
      (location.state as { feedback?: BudgetFeedback } | null)?.feedback ??
      null,
  )

  const [isEditing, setIsEditing] = useState(false)
  const [totalLimitInput, setTotalLimitInput] = useState(
    formatAmountInput(String(budget?.totalLimitMinor ?? 0)),
  )

  useEffect(() => {
    if (isEditing) return
    setTotalLimitInput(formatAmountInput(String(budget?.totalLimitMinor ?? 0)))
  }, [budget?.totalLimitMinor, isEditing])

  const canEdit = useMemo(() => {
    if (!budget) return false
    if (budget.scope === 'household') {
      return budget.createdByUserId === currentUserId
    }
    if (budget.scope === 'personal') {
      return budget.ownerUserId === currentUserId
    }

    return false
  }, [budget, currentUserId])

  const handleRefresh = async () => {
    await Promise.all([
      detailQuery.refetch(),
      statusQuery.refetch(),
      householdsQuery.refetch(),
    ])
  }

  const handleUpdate = async (values: BudgetMutationFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: budget!.id,
        payload: buildBudgetMutationRequest(values),
      })

      impact('light')
      setFeedback({ message: t('budgets.detail.updated'), tone: 'success' })
      setIsEditing(false)
      await statusQuery.refetch()
    } catch {
      setFeedback({ message: t('budgets.detail.updateError'), tone: 'error' })
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(t('budgets.detail.deleteConfirm'))
    if (!confirmed) return

    try {
      await deleteMutation.mutateAsync(budget!.id)
      impact('medium')

      navigate(TMA_PATHS.budgets, {
        replace: true,
        state: {
          feedback: { message: t('budgets.detail.deleted'), tone: 'success' },
        },
      })
    } catch {
      setFeedback({ message: t('budgets.detail.deleteError'), tone: 'error' })
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const totalLimitMinor = parseBudgetAmountInputToMinor(totalLimitInput)
    if (!totalLimitMinor || totalLimitMinor <= 0) return

    void handleUpdate({
      mode: 'edit',
      period: budget!.period,
      scope: budget!.scope,
      totalLimitMinor,
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (budget) {
      setTotalLimitInput(formatAmountInput(String(budget.totalLimitMinor)))
    }
  }

  if (!id) {
    return (
      <TmaPageShell
        contentClassName='flex flex-col gap-4'
        title={t('budgets.detail.title')}>
        <Card size='sm'>
          <CardHeader>
            <CardTitle>{t('budgets.detail.invalidIdTitle')}</CardTitle>
            <CardDescription>
              {t('budgets.detail.invalidIdDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </TmaPageShell>
    )
  }

  const showEditFooter = Boolean(canEdit && isEditing && budget)

  return (
    <TmaPageShell
      contentClassName='flex flex-col gap-4'
      footer={
        showEditFooter ? (
          <TmaPageFooter>
            <TmaHapticButton
              disabled={updateMutation.isPending}
              type='button'
              variant='secondary'
              onClick={handleCancelEdit}>
              {t('common.cancel')}
            </TmaHapticButton>
            <TmaHapticButton
              aria-busy={updateMutation.isPending}
              disabled={updateMutation.isPending}
              form='budget-edit-form'
              type='submit'>
              {updateMutation.isPending
                ? t('budgets.detail.editing')
                : t('budgets.detail.save')}
            </TmaHapticButton>
          </TmaPageFooter>
        ) : undefined
      }
      title={t('budgets.detail.title')}
      onRefresh={handleRefresh}>
      <QueryState
        empty={{
          title: t('budgets.detail.notFoundTitle'),
          description: t('budgets.detail.notFoundDesc'),
        }}
        error={{
          title: t('budgets.detail.loadError'),
          description: t('budgets.detail.loadErrorDesc'),
        }}
        isEmpty={(data: BudgetDTO) => !data}
        pending={{
          title: t('budgets.detail.loading'),
          description: t('budgets.detail.loadingDesc'),
        }}
        query={detailQuery}
        retryAction={() => void detailQuery.refetch()}
        variant='card'>
        {(loadedBudget: BudgetDTO) => {
          // Derive household inline (non-blocking, no extra QueryState)
          const resolvedHousehold =
            households.find((entry) => entry.id === loadedBudget.householdId) ??
            household ??
            undefined

          return (
            <div className='flex flex-col gap-4'>
              {feedback ? <BudgetFeedbackCard feedback={feedback} /> : null}

              <BudgetHeroCard
                budget={loadedBudget}
                household={resolvedHousehold}
                status={status ?? undefined}
                t={t}
              />

              {/* Status is secondary — own QueryState so it never blocks hero */}
              <BudgetStatusBlock statusQuery={statusQuery} t={t} />

              {canEdit ? (
                <BudgetManageCard
                  isDeletePending={deleteMutation.isPending}
                  isEditing={isEditing}
                  isUpdatePending={updateMutation.isPending}
                  t={t}
                  totalLimitInput={totalLimitInput}
                  onCancelEdit={handleCancelEdit}
                  onDelete={() => void handleDelete()}
                  onStartEdit={() => setIsEditing(true)}
                  onSubmit={handleSubmit}
                  onTotalLimitChange={setTotalLimitInput}
                />
              ) : null}
            </div>
          )
        }}
      </QueryState>
    </TmaPageShell>
  )
}
