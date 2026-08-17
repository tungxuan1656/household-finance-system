import { backButton, miniApp } from '@tma.js/sdk'
import { useEffect, useEffectEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-provider'
import {
  useAcceptInvitationMutation,
  useInvitationPreviewQuery,
} from '@/features/invitations/api/invitation'
import { getHouseholdDetailPath } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { impact, notification } from '@/lib/telegram/haptics'

export const AcceptInvitationPage = () => {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const previewQuery = useInvitationPreviewQuery(token)
  const acceptMutation = useAcceptInvitationMutation()

  const [acceptedHouseholdId, setAcceptedHouseholdId] = useState<string | null>(
    null,
  )

  const preview = previewQuery.data
  const isPreviewLoading = previewQuery.isLoading && !preview
  const isPreviewError = previewQuery.isError && !preview
  const isPreviewEmpty =
    !previewQuery.isLoading && !previewQuery.isError && !preview

  useEffect(() => {
    if (acceptedHouseholdId) {
      navigate(getHouseholdDetailPath(acceptedHouseholdId), { replace: true })
    }
  }, [acceptedHouseholdId, navigate])

  const handleAccept = useEffectEvent(async () => {
    if (!token) return

    try {
      const result = await acceptMutation.mutateAsync(token)
      notification('success')
      setAcceptedHouseholdId(result.householdId)
    } catch {
      notification('error')
    }
  })

  const canShowAcceptCta = Boolean(token) && isAuthenticated && Boolean(preview)

  // Own the Telegram BackButton on this route. AcceptInvitationPage is a
  // deep-link entry point (?startapp=<token>), so there is no in-app
  // history to navigate back to. Pressing the system/Telegram back action
  // must close the mini app, matching the deep-link "go back to Telegram"
  // expectation. RootLayout skips its own BackButton binding on this path.
  useEffect(() => {
    if (!backButton.isSupported()) {
      return
    }

    const offClick = backButton.onClick(() => {
      impact('light')
      miniApp.close.ifAvailable()
    })
    backButton.show()

    return () => {
      offClick()
      backButton.hide()
    }
  }, [])

  const toRoleLabel = (role: 'admin' | 'member'): string =>
    role === 'admin' ? t('invitations.roleAdmin') : t('invitations.roleMember')

  if (!token) {
    return (
      <TmaPageShell title={t('invitations.acceptTitle')}>
        <Card className='p-4'>
          <CardTitle>{t('invitations.invalidTokenTitle')}</CardTitle>
          <CardDescription>{t('invitations.invalidTokenDesc')}</CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('invitations.acceptTitle')}>
      <DataState
        emptyDescription={t('invitations.notFoundDesc')}
        emptyTitle={t('invitations.notFoundTitle')}
        errorDescription={t('invitations.loadErrorDesc')}
        errorTitle={t('invitations.loadError')}
        isEmpty={isPreviewEmpty}
        isError={isPreviewError}
        isLoading={isPreviewLoading}
        loadingDescription={t('invitations.loadingDesc')}
        loadingTitle={t('invitations.loading')}
        retryAction={previewQuery.refetch}>
        {preview ? (
          <Card className='mt-3 p-4'>
            <CardTitle>{t('invitations.acceptTitle')}</CardTitle>
            <CardDescription>{t('invitations.acceptDesc')}</CardDescription>

            <CardContent className='mt-3 px-0'>
              <dl className='grid gap-3'>
                <div className='flex flex-col gap-1'>
                  <dt className='text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
                    {t('invitations.householdName')}
                  </dt>
                  <dd className='m-0 text-sm font-semibold text-foreground'>
                    {preview.household.name}
                  </dd>
                </div>
                <div className='flex flex-col gap-1'>
                  <dt className='text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
                    {t('invitations.roleLabel')}
                  </dt>
                  <dd className='m-0 text-sm font-semibold text-foreground'>
                    {toRoleLabel(preview.invitedRole)}
                  </dd>
                </div>
                <div className='flex flex-col gap-1'>
                  <dt className='text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
                    {t('invitations.expiresAt')}
                  </dt>
                  <dd className='m-0 text-sm font-semibold text-foreground'>
                    {formatDateLabel(new Date(preview.expiresAt).toISOString())}
                  </dd>
                </div>
              </dl>

              {!isAuthenticated ? (
                <div className='mt-4'>
                  <p className='m-0 text-sm text-muted-foreground'>
                    {t('invitations.requiresAuth')}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </DataState>
      {canShowAcceptCta ? (
        <TmaHapticButton
          aria-busy={acceptMutation.isPending}
          className='mt-4 mb-2 w-full'
          disabled={acceptMutation.isPending}
          onClick={() => {
            void handleAccept()
          }}>
          {acceptMutation.isPending
            ? t('invitations.accepting')
            : t('invitations.acceptAction')}
        </TmaHapticButton>
      ) : null}
    </TmaPageShell>
  )
}
