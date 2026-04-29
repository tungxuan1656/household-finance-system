'use client'

import {
  ProfileAvatarSection,
  ProfileDisplayNameForm,
} from '@/components/profile'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  useCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} from '@/hooks/api/use-profile'
import { t } from '@/lib/i18n/t'

export const ProfileSettingsPage = () => {
  const profileQuery = useCurrentUserProfileQuery()
  const updateProfileMutation = useUpdateCurrentUserProfileMutation()

  if (profileQuery.isLoading && !profileQuery.data) {
    return <p>{t('app.settings.profile.loading')}</p>
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className='flex flex-col gap-3'>
        <p>{t('app.settings.profile.errors.loadFailed')}</p>
        <Button variant='outline' onClick={() => void profileQuery.refetch()}>
          {t('app.settings.profile.actions.retry')}
        </Button>
      </div>
    )
  }

  const isBusy = updateProfileMutation.isPending || profileQuery.isFetching

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.settings.profile.title')}</CardTitle>
        <CardDescription>
          {t('app.settings.profile.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-8'>
        <ProfileAvatarSection
          avatarUrl={profileQuery.data.avatarUrl}
          displayName={profileQuery.data.displayName}
          email={profileQuery.data.email}
          isBusy={isBusy}
          onAvatarUploaded={async (avatarUrl) => {
            await updateProfileMutation.mutateAsync({
              avatarUrl,
            })
          }}
        />

        <div className='h-px w-full bg-border' />

        <ProfileDisplayNameForm
          defaultDisplayName={profileQuery.data.displayName}
          isSubmitting={isBusy}
          onSubmit={async (displayName) => {
            await updateProfileMutation.mutateAsync({
              displayName,
            })
          }}
        />
      </CardContent>
    </Card>
  )
}
