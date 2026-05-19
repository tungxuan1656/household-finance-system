'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ApiClientError } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  acceptInvitation,
  getInvitationPreview,
} from '@/features/invitations/api/invitation'
import type { InvitationPreviewResponse } from '@/features/invitations/types/invitation'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { useAuthStore } from '@/stores/auth.store'
import { DATE_TIME_FORMATS } from '@/utils/datetime/constants'
import { formatDate } from '@/utils/datetime/format'

const toRoleLabel = (role: 'admin' | 'member'): string =>
  role === 'admin'
    ? t('app.householdDetail.members.invite.fields.role.options.admin')
    : t('app.householdDetail.members.invite.fields.role.options.member')

const toSignInPath = (pathname: string): string =>
  `${PATHS.SIGN_IN}?returnTo=${encodeURIComponent(pathname)}`

export function AcceptInvitationPage({ token }: { token: string }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore.use.isAuthenticated()
  const isSessionChecked = useAuthStore.use.isSessionChecked()
  const [preview, setPreview] = useState<InvitationPreviewResponse | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const invitationPath = useMemo(() => `/invitations/${token}`, [token])

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        setIsLoadingPreview(true)

        const result = await getInvitationPreview(token)
        if (!active) return
        setPreview(result)
        setErrorMessage(null)
      } catch (error) {
        if (!active) return
        setPreview(null)

        setErrorMessage(
          error instanceof ApiClientError
            ? error.message
            : t('app.invitationAccept.feedback.loadFailed'),
        )
      } finally {
        if (active) setIsLoadingPreview(false)
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [token])

  const handleAcceptInvitation = async () => {
    try {
      setIsAccepting(true)

      const result = await acceptInvitation(token)
      toast.success(t('app.invitationAccept.feedback.acceptSuccess'))
      router.replace(`${PATHS.HOUSEHOLDS}/${result.householdId}`)
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : t('app.invitationAccept.feedback.acceptFailed'),
      )
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoadingPreview) {
    return (
      <div className='mx-auto w-full max-w-2xl'>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground'>
            {t('app.invitationAccept.states.loading')}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!preview || errorMessage) {
    return (
      <div className='mx-auto w-full max-w-2xl'>
        <Card>
          <CardHeader>
            <CardTitle>{t('app.invitationAccept.title')}</CardTitle>
            <CardDescription>
              {t('app.invitationAccept.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-destructive'>
              {errorMessage ?? t('app.invitationAccept.feedback.loadFailed')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle>{t('app.invitationAccept.title')}</CardTitle>
          <CardDescription>
            {t('app.invitationAccept.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <dl className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground'>
                {t('app.householdDetail.fields.householdName.label')}
              </dt>
              <dd className='font-medium'>{preview.household.name}</dd>
            </div>
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground'>
                {t('app.invitationAccept.meta.role')}
              </dt>
              <dd className='font-medium'>
                {toRoleLabel(preview.invitedRole)}
              </dd>
            </div>
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground'>
                {t('app.invitationAccept.meta.expiresAt')}
              </dt>
              <dd className='font-medium'>
                {formatDate(preview.expiresAt, DATE_TIME_FORMATS.dateTime)}
              </dd>
            </div>
          </dl>

          {!isSessionChecked || !isAuthenticated ? (
            <>
              <p className='text-sm text-muted-foreground'>
                {t('app.invitationAccept.states.requiresAuth')}
              </p>
              <Button
                type='button'
                onClick={() => {
                  router.replace(toSignInPath(invitationPath))
                }}>
                {t('app.invitationAccept.actions.goToSignIn')}
              </Button>
            </>
          ) : (
            <Button
              disabled={isAccepting}
              type='button'
              onClick={() => void handleAcceptInvitation()}>
              {isAccepting
                ? t('app.invitationAccept.actions.accepting')
                : t('app.invitationAccept.actions.accept')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
