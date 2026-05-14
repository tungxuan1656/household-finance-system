'use client'

import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/ui/page-shell'
import {
  useCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} from '@/hooks/api/use-profile'
import { t } from '@/lib/i18n/t'
import { AccountActionsCard } from '@/views/app/profile-settings/account-actions-card'
import { ProfileAvatarCard } from '@/views/app/profile-settings/profile-avatar-card'
import { ProfileDetailsCard } from '@/views/app/profile-settings/profile-details-card'

export const ProfileSettingsPage = () => {
  const profileQuery = useCurrentUserProfileQuery()
  const updateProfileMutation = useUpdateCurrentUserProfileMutation()

  if (profileQuery.isLoading && !profileQuery.data) {
    return (
      <PageShell title={t('shell.protected.nav.settings')}>
        <p>{t('app.settings.profile.loading')}</p>
      </PageShell>
    )
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <PageShell title={t('shell.protected.nav.settings')}>
        <div className='flex flex-col gap-3'>
          <p>{t('app.settings.profile.errors.loadFailed')}</p>
          <Button
            className='min-h-11'
            variant='outline'
            onClick={() => void profileQuery.refetch()}>
            {t('app.settings.profile.actions.retry')}
          </Button>
        </div>
      </PageShell>
    )
  }

  const isBusy = updateProfileMutation.isPending || profileQuery.isFetching

  return (
    <PageShell title={t('shell.protected.nav.settings')}>
      <div className='flex flex-col gap-4 md:gap-6'>
        <ProfileAvatarCard
          avatarUrl={profileQuery.data.avatarUrl}
          displayName={profileQuery.data.displayName}
          email={profileQuery.data.email}
          isBusy={isBusy}
          onAvatarUploaded={async (avatarUrl) => {
            await updateProfileMutation.mutateAsync({ avatarUrl })
          }}
        />
        <ProfileDetailsCard
          defaultDisplayName={profileQuery.data.displayName}
          email={profileQuery.data.email}
          isBusy={isBusy}
          onDisplayNameSubmit={async (displayName) => {
            await updateProfileMutation.mutateAsync({ displayName })
          }}
        />
        <AccountActionsCard />
      </div>
    </PageShell>
  )
}
