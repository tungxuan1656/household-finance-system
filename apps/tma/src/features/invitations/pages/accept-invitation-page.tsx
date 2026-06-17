import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  DataState,
} from '@/components/ui'
import { useAuth } from '@/features/auth/auth-provider'
import {
  useAcceptInvitationMutation,
  useInvitationPreviewQuery,
} from '@/features/invitations/api/invitation'
import { getHouseholdDetailPath } from '@/lib/constants/routes'
import { notification } from '@/lib/telegram/haptics'

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

  const handleAccept = async () => {
    if (!token) return

    try {
      const result = await acceptMutation.mutateAsync(token)
      notification('success')
      setAcceptedHouseholdId(result.householdId)
    } catch {
      notification('error')
    }
  }

  const toRoleLabel = (role: 'admin' | 'member'): string =>
    role === 'admin' ? t('invitations.roleAdmin') : t('invitations.roleMember')

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)

    return date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!token) {
    return (
      <TmaPageShell title={t('invitations.acceptTitle')}>
        <Card>
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
          <Card className='mt-3'>
            <CardTitle>{t('invitations.acceptTitle')}</CardTitle>
            <CardDescription>{t('invitations.acceptDesc')}</CardDescription>

            <CardContent className='mt-3'>
              <dl className='grid gap-3'>
                <div className='flex flex-col gap-1'>
                  <dt className='text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'>
                    {t('invitations.householdName')}
                  </dt>
                  <dd className='m-0 text-sm font-semibold text-tma-text-strong'>
                    {preview.household.name}
                  </dd>
                </div>
                <div className='flex flex-col gap-1'>
                  <dt className='text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'>
                    {t('invitations.roleLabel')}
                  </dt>
                  <dd className='m-0 text-sm font-semibold text-tma-text-strong'>
                    {toRoleLabel(preview.invitedRole)}
                  </dd>
                </div>
                <div className='flex flex-col gap-1'>
                  <dt className='text-[11px] font-bold tracking-[0.04em] text-tma-text-muted uppercase'>
                    {t('invitations.expiresAt')}
                  </dt>
                  <dd className='m-0 text-sm font-semibold text-tma-text-strong'>
                    {formatDate(preview.expiresAt)}
                  </dd>
                </div>
              </dl>

              {!isAuthenticated ? (
                <div className='mt-4'>
                  <p className='m-0 text-sm text-tma-text-muted'>
                    {t('invitations.requiresAuth')}
                  </p>
                </div>
              ) : (
                <div className='mt-4'>
                  <Button
                    disabled={acceptMutation.isPending}
                    size='md'
                    variant='primary'
                    onClick={handleAccept}>
                    {acceptMutation.isPending
                      ? t('invitations.accepting')
                      : t('invitations.acceptAction')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
