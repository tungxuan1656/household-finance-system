'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import { DataState } from '@/components/shared/data-state'
import {
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components/shared/page'
import type { UpdateHouseholdSettingsFormValues } from '@/features/households/lib/forms/household.schema'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

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
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const members = useHouseholdStore.use.members()
  const isLoading = useHouseholdStore.use.isLoading()
  const error = useHouseholdStore.use.error()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    void householdActions.fetchHouseholdById(id)
  }, [id])

  const handleSaveSettings = async (
    values: UpdateHouseholdSettingsFormValues,
  ) => {
    if (!id) return
    try {
      await householdActions.updateHousehold(id, values)
      toast.success(t('app.householdDetail.feedback.updateSuccess'))
    } catch {
      toast.error(t('app.householdDetail.feedback.updateFailed'))
    }
  }
  const handleArchive = async () => {
    if (!id) return
    try {
      await householdActions.archiveHousehold(id)
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

  const isAdmin = currentHousehold?.role === 'admin'

  return (
    <PageContainer>
      <PageHeader
        showBack
        title={t('app.householdDetail.title')}
        onBack={() => router.back()}
      />
      <PageContent>
        <DataState
          errorDescription={error ?? undefined}
          isError={Boolean(!isLoading && error && !currentHousehold)}
          isLoading={isLoading && !currentHousehold}
          retryAction={() => void householdActions.fetchHouseholdById(id)}>
          {currentHousehold ? (
            <div className='grid gap-4'>
              <HouseholdSettingsCard
                household={currentHousehold}
                isAdmin={isAdmin}
                isSubmitting={isLoading}
                memberCount={members.length}
                onSubmit={handleSaveSettings}
              />
              <HouseholdMembersCard
                householdId={currentHousehold.id}
                isAdmin={isAdmin}
              />
              {isAdmin ? (
                <>
                  <InviteMembersActionCard
                    onAction={() => setIsInviteDialogOpen(true)}
                  />
                  <HouseholdInviteDialog
                    householdId={currentHousehold.id}
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
