'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import {
  HouseholdDangerZoneCard,
  HouseholdDetailHeader,
  HouseholdMembersCard,
  HouseholdSettingsCard,
} from '@/components/household'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PATHS } from '@/lib/constants/paths'
import type { UpdateHouseholdSettingsFormValues } from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

const isConflictError = (error: unknown): boolean => {
  if (!(error instanceof ApiClientError)) {
    return false
  }

  return error.status === 409 || error.code === 'CONFLICT'
}

function HouseholdDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()

  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const members = useHouseholdStore.use.members()
  const isLoading = useHouseholdStore.use.isLoading()
  const error = useHouseholdStore.use.error()

  useEffect(() => {
    if (!id) {
      return
    }

    void householdActions.fetchHouseholdById(id)
  }, [id])

  const handleSaveSettings = async (
    values: UpdateHouseholdSettingsFormValues,
  ) => {
    if (!id) {
      return
    }

    try {
      await householdActions.updateHousehold(id, values)
      toast.success(t('app.householdDetail.feedback.updateSuccess'))
    } catch {
      toast.error(t('app.householdDetail.feedback.updateFailed'))
    }
  }

  const handleArchive = async () => {
    if (!id) {
      return
    }

    try {
      await householdActions.archiveHousehold(id)
      toast.success(t('app.householdDetail.feedback.archiveSuccess'))
      router.replace(PATHS.HOUSEHOLDS)
    } catch (archiveError) {
      if (isConflictError(archiveError)) {
        toast.error(t('app.householdDetail.feedback.archiveBlockedByMembers'))
      } else {
        toast.error(t('app.householdDetail.feedback.archiveFailed'))
      }
    }
  }

  if (!id) {
    return (
      <p className='text-sm text-muted-foreground'>
        {t('app.householdDetail.invalidId')}
      </p>
    )
  }

  const isAdmin = currentHousehold?.role === 'admin'

  return (
    <div className='flex flex-col gap-6'>
      <HouseholdDetailHeader />

      {isLoading ? (
        <Card>
          <CardContent className='pt-1 text-sm text-muted-foreground'>
            {t('app.householdDetail.loading')}
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && error ? (
        <Card>
          <CardContent className='flex items-center justify-between gap-2 pt-1'>
            <p className='text-sm text-destructive'>{error}</p>
            <Button
              type='button'
              variant='outline'
              onClick={() => void householdActions.fetchHouseholdById(id)}>
              {t('app.householdDetail.actions.retry')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && currentHousehold ? (
        <>
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
          {isAdmin && <HouseholdDangerZoneCard onArchive={handleArchive} />}
        </>
      ) : null}
    </div>
  )
}

export { HouseholdDetailPage }
