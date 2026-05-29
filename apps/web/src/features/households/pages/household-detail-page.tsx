'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import { DataState } from '@/components/shared/data-state'
import {
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components/shared/page'
import { RecentExpensesCard } from '@/features/expenses/components/recent-expenses-card'
import {
  useArchiveHouseholdMutation,
  useUpdateHouseholdMutation,
} from '@/features/households/hooks/use-household-mutations'
import { useHouseholdDetailQuery } from '@/features/households/hooks/use-households'
import { useHouseholdMembersQuery } from '@/features/households/hooks/use-households'
import type { UpdateHouseholdSettingsFormValues } from '@/features/households/lib/forms/household.schema'
import { InsightsSection } from '@/features/insights/components/insights-section'
import { getDefaultPeriod } from '@/features/insights/utils/insights-period'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

import { InviteMembersActionCard } from '../components/household-action-card'
import { HouseholdDangerZoneCard } from '../components/household-danger-zone-card'
import { HouseholdInviteDialog } from '../components/household-invite-dialog'
import { HouseholdMembersCard } from '../components/household-members-card'
import { HouseholdSettingsCard } from '../components/household-settings-card'

const isConflictError = (error: unknown): boolean =>
  error instanceof ApiClientError &&
  (error.status === 409 || error.code === 'CONFLICT')

function HouseholdDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  const {
    data: household,
    isLoading: isHouseholdLoading,
    error: householdError,
    refetch: refetchHousehold,
  } = useHouseholdDetailQuery(id)

  const { data: membersData, isLoading: isMembersLoading } =
    useHouseholdMembersQuery(id)

  const updateHouseholdMutation = useUpdateHouseholdMutation()
  const archiveHouseholdMutation = useArchiveHouseholdMutation()

  const isLoading = isHouseholdLoading || isMembersLoading
  const error = householdError
  const members = membersData?.items ?? []

  const handleSaveSettings = async (
    values: UpdateHouseholdSettingsFormValues,
  ) => {
    if (!id) return
    try {
      await updateHouseholdMutation.mutateAsync({
        householdId: id,
        payload: values,
      })

      await refetchHousehold()
      toast.success(t('app.householdDetail.feedback.updateSuccess'))
    } catch {
      toast.error(t('app.householdDetail.feedback.updateFailed'))
    }
  }
  const handleArchive = async () => {
    if (!id) return
    try {
      await archiveHouseholdMutation.mutateAsync(id)
      toast.success(t('app.householdDetail.feedback.archiveSuccess'))
      router.replace(PATHS.HOUSEHOLDS)
    } catch (archiveError) {
      toast.error(
        isConflictError(archiveError)
          ? t('app.householdDetail.feedback.archiveBlockedByMembers')
          : t('app.householdDetail.feedback.archiveFailed'),
      )
    }
  }
  if (!id)
    return (
      <PageContainer>
        <PageHeader
          showBack
          title={t('app.householdDetail.title')}
          onBack={() => router.replace(PATHS.HOUSEHOLDS)}
        />
        <PageContent>
          <p className='text-sm text-muted-foreground'>
            {t('app.householdDetail.invalidId')}
          </p>
        </PageContent>
      </PageContainer>
    )

  const isAdmin = household?.role === 'admin'

  return (
    <PageContainer>
      <PageHeader
        showBack
        title={t('app.householdDetail.title')}
        onBack={() => router.back()}
      />
      <PageContent>
        <DataState
          errorDescription={error?.message ?? undefined}
          isError={Boolean(!isLoading && error && !household)}
          isLoading={isLoading && !household}
          retryAction={() => void refetchHousehold()}>
          {household ? (
            <div className='grid gap-4'>
              <HouseholdSettingsCard
                household={household}
                isAdmin={isAdmin}
                isSubmitting={updateHouseholdMutation.isPending}
                memberCount={members.length}
                onSubmit={handleSaveSettings}
              />
              <InsightsSection
                householdId={household.id}
                period={getDefaultPeriod()}
              />
              <RecentExpensesCard householdId={household.id} limit={3} />
              <HouseholdMembersCard
                householdId={household.id}
                isAdmin={isAdmin}
              />
              {isAdmin ? (
                <>
                  <InviteMembersActionCard
                    onAction={() => setIsInviteDialogOpen(true)}
                  />
                  <HouseholdInviteDialog
                    householdId={household.id}
                    isOpen={isInviteDialogOpen}
                    trigger={null}
                    onOpenChange={setIsInviteDialogOpen}
                  />
                </>
              ) : null}
              {isAdmin && <HouseholdDangerZoneCard onArchive={handleArchive} />}
            </div>
          ) : null}
        </DataState>
      </PageContent>
    </PageContainer>
  )
}

export { HouseholdDetailPage }
