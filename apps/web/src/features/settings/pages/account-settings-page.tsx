'use client'

import { toast } from 'sonner'

import { DataState } from '@/components/shared/data-state'
import {
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components/shared/page'
import { Button } from '@/components/ui/button'
import { AccountActionsCard } from '@/features/settings/components/account-actions-card'
import { ProfileAvatarCard } from '@/features/settings/components/profile-avatar-card'
import { ProfileDetailsCard } from '@/features/settings/components/profile-details-card'
import { ProfilePasswordCard } from '@/features/settings/components/profile-password-card'
import {
  useCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} from '@/hooks/api/use-profile'
import { t } from '@/lib/i18n/t'

export const AccountSettingsPage = () => {
  const profileQuery = useCurrentUserProfileQuery()
  const updateProfileMutation = useUpdateCurrentUserProfileMutation()
  const shouldShowLoadingState = profileQuery.isLoading && !profileQuery.data
  const shouldShowBlockingError =
    !shouldShowLoadingState && (profileQuery.isError || !profileQuery.data)

  const isBusy = updateProfileMutation.isPending || profileQuery.isFetching

  return (
    <PageContainer>
      <PageHeader showBack title={t('shell.protected.nav.settings')} />
      <PageContent>
        <DataState
          customAction={
            shouldShowBlockingError ? (
              <Button
                className='min-h-11'
                variant='outline'
                onClick={() => void profileQuery.refetch()}>
                {t('app.settings.profile.actions.retry')}
              </Button>
            ) : undefined
          }
          errorDescription=''
          errorTitle={t('app.settings.profile.errors.loadFailed')}
          isError={shouldShowBlockingError}
          isLoading={shouldShowLoadingState}>
          {profileQuery.data ? (
            <div className='flex flex-col gap-4 md:gap-6'>
              <ProfileAvatarCard
                avatarUrl={profileQuery.data.avatarUrl}
                displayName={profileQuery.data.displayName}
                email={profileQuery.data.email}
                isBusy={isBusy}
                onAvatarUploaded={async (avatarUrl) => {
                  await updateProfileMutation.mutateAsync({ avatarUrl })
                  toast.success(t('app.settings.profile.actions.avatarUpdated'))
                }}
              />
              <ProfileDetailsCard
                defaultDisplayName={profileQuery.data.displayName}
                email={profileQuery.data.email}
                isBusy={isBusy}
                onDisplayNameSubmit={async (displayName) => {
                  await updateProfileMutation.mutateAsync({ displayName })

                  toast.success(
                    t('app.settings.profile.actions.displayNameUpdated'),
                  )
                }}
              />
              <ProfilePasswordCard isBusy={isBusy} />
              <AccountActionsCard />
            </div>
          ) : null}
        </DataState>
      </PageContent>
    </PageContainer>
  )
}
