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

const getHouseholdHref = (householdId: string) =>
  `${PATHS.HOUSEHOLDS}/${householdId}`

export const ProfileSettingsPage = () => {
  const profileQuery = useCurrentUserProfileQuery()
  const updateProfileMutation = useUpdateCurrentUserProfileMutation()
  const households = useHouseholdStore.use.households()
  const householdsError = useHouseholdStore.use.error()
  const isHouseholdsLoading = useHouseholdStore.use.isLoading()
  const shouldFetchHouseholds = households.length === 0 && !isHouseholdsLoading

  const handleRetryHouseholds = () => {
    void householdActions.fetchHouseholds()
  }

  useEffect(() => {
    if (!shouldFetchHouseholds) {
      return
    }

    handleRetryHouseholds()
  }, [shouldFetchHouseholds])

  if (profileQuery.isLoading && !profileQuery.data) {
    return <p>{t('app.settings.profile.loading')}</p>
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className='flex flex-col gap-3'>
        <p>{t('app.settings.profile.errors.loadFailed')}</p>
        <Button
          className='min-h-11'
          variant='outline'
          onClick={() => void profileQuery.refetch()}>
          {t('app.settings.profile.actions.retry')}
        </Button>
      </div>
    )
  }

  const isBusy = updateProfileMutation.isPending || profileQuery.isFetching

  return (
    <div className='flex flex-col gap-4 md:gap-6'>
      <h1 className='font-heading text-xl font-semibold md:text-2xl'>
        {t('shell.protected.nav.settings')}
      </h1>

      {/* Profile — Avatar & Display Name */}
      <Card className='border border-transparent transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>
            {t('app.settings.profile.title')}
          </CardTitle>
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

      {/* Account — Identity Info */}
      <Card className='border border-transparent transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>
            {t('app.settings.account.title')}
          </CardTitle>
          <CardDescription>
            {t('app.settings.account.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 text-sm'>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground'>
              {t('app.settings.account.fields.displayName')}
            </span>
            <span className='font-medium'>{profileQuery.data.displayName}</span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground'>
              {t('app.settings.account.fields.email')}
            </span>
            <span className='font-medium'>{profileQuery.data.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Memberships — Household Access */}
      <Card className='border border-transparent transition-all duration-200 hover:border-primary/20 hover:shadow-md'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>
            {t('app.settings.memberships.title')}
          </CardTitle>
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
            <div className='flex flex-col gap-3'>
              <p className='text-sm text-destructive' role='alert'>
                {t('app.settings.memberships.errors.loadFailed')}
              </p>
              <Button
                className='min-h-11'
                variant='outline'
                onClick={handleRetryHouseholds}>
                {t('app.settings.memberships.actions.retry')}
              </Button>
            </div>
          ) : null}

          {!isHouseholdsLoading &&
          !householdsError &&
          households.length === 0 ? (
            <div className='flex flex-col gap-3'>
              <p className='text-sm text-muted-foreground'>
                {t('app.settings.memberships.empty')}
              </p>
              <Link
                className='inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
                href={PATHS.ONBOARDING}>
                {t('common.actions.openOnboarding')}
              </Link>
            </div>
          ) : null}

          {households.map((household) => (
            <Link
              key={household.id}
              aria-label={household.name}
              className='flex min-h-11 items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none'
              href={getHouseholdHref(household.id)}>
              <span className='min-w-0 flex-1 truncate'>{household.name}</span>
              <Badge aria-hidden='true' variant='secondary'>
                {t(
                  `app.householdDetail.members.invite.fields.role.options.${household.role}`,
                )}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
