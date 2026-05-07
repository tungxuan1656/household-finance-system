'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import {
  ProfileAvatarSection,
  ProfileDisplayNameForm,
} from '@/components/profile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  useCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} from '@/hooks/api/use-profile'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

const householdShortcutKeyByRole = {
  admin: [
    'viewHousehold',
    'manageMembers',
    'openHouseholdSettings',
    'inviteMembers',
  ],
  member: ['viewHousehold'],
} as const

const getHouseholdShortcutHref = (householdId: string) =>
  `${PATHS.HOUSEHOLDS}/${householdId}`

export const ProfileSettingsPage = () => {
  const profileQuery = useCurrentUserProfileQuery()
  const updateProfileMutation = useUpdateCurrentUserProfileMutation()
  const households = useHouseholdStore.use.households()
  const householdsError = useHouseholdStore.use.error()
  const isHouseholdsLoading = useHouseholdStore.use.isLoading()

  useEffect(() => {
    void householdActions.fetchHouseholds()
  }, [])

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
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>{t('app.settings.account.title')}</CardTitle>
          <CardDescription>
            {t('app.settings.account.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2 text-sm'>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground'>
              {t('app.settings.account.fields.displayName')}
            </span>
            <span>{profileQuery.data.displayName}</span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground'>
              {t('app.settings.account.fields.email')}
            </span>
            <span>{profileQuery.data.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('app.settings.memberships.title')}</CardTitle>
          <CardDescription>
            {t('app.settings.memberships.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {isHouseholdsLoading && households.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              {t('app.settings.memberships.loading')}
            </p>
          ) : null}

          {!isHouseholdsLoading &&
          householdsError &&
          households.length === 0 ? (
            <p className='text-sm text-destructive'>{householdsError}</p>
          ) : null}

          {!isHouseholdsLoading &&
          !householdsError &&
          households.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              {t('app.settings.memberships.empty')}
            </p>
          ) : null}

          {households.map((household) => (
            <div
              key={household.id}
              className='flex items-center justify-between gap-3 rounded-lg border p-3'>
              <span>{household.name}</span>
              <Badge variant='secondary'>
                {t(
                  `app.householdDetail.members.invite.fields.role.options.${household.role}`,
                )}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('app.settings.shortcuts.title')}</CardTitle>
          <CardDescription>
            {t('app.settings.shortcuts.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {!isHouseholdsLoading && households.length === 0 ? (
            <Link
              className='text-sm underline underline-offset-4'
              href={PATHS.ONBOARDING}>
              {t('common.actions.openOnboarding')}
            </Link>
          ) : null}

          {households.map((household) => (
            <div key={household.id} className='flex flex-wrap gap-3'>
              {householdShortcutKeyByRole[household.role].map((shortcutKey) => (
                <Link
                  key={`${household.id}-${shortcutKey}`}
                  className='text-sm underline underline-offset-4'
                  href={getHouseholdShortcutHref(household.id)}>
                  {t(`app.settings.shortcuts.actions.${shortcutKey}`)}
                </Link>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

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

          <Separator />

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
    </div>
  )
}
