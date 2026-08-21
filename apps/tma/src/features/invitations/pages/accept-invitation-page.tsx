import { backButton, miniApp } from '@tma.js/sdk'
import { AlertTriangle, Clock3, ShieldCheck, UsersRound } from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { QueryState } from '@/components/shared/query-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageFooter, TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-provider'
import {
  useAcceptInvitationMutation,
  useInvitationPreviewQuery,
} from '@/features/invitations/api'
import type { InvitationPreviewResponse } from '@/features/invitations/types'
import { getHouseholdDetailPath } from '@/lib/constants/routes'
import { formatDateLabel } from '@/lib/formatters'
import { impact, notification } from '@/lib/telegram/haptics'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Dumb preview card — no outer margin, parent gap owns spacing
// ---------------------------------------------------------------------------

function InvitationPreviewCard({
  isAuthenticated,
  preview,
}: {
  isAuthenticated: boolean
  preview: InvitationPreviewResponse
}) {
  const { t } = useTranslation()

  const roleLabel =
    preview.invitedRole === 'admin'
      ? t('invitations.roleAdmin')
      : t('invitations.roleMember')

  const expiresLabel = formatDateLabel(
    new Date(preview.expiresAt).toISOString(),
  )

  return (
    <Card size='sm'>
      <CardHeader>
        <div className='flex items-start gap-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'>
            <UsersRound aria-hidden className='size-5' />
          </span>
          <div className='min-w-0 flex-1'>
            <CardTitle>{t('invitations.acceptTitle')}</CardTitle>
            <CardDescription className='mt-1'>
              {t('invitations.acceptDesc')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className='grid gap-0 divide-y divide-border/60'>
        <div className='grid gap-1 py-3 first:pt-0'>
          <span className='flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground'>
            <UsersRound aria-hidden className='size-3.5 opacity-60' />
            {t('invitations.householdName')}
          </span>
          <p className='truncate text-[15px] leading-tight font-semibold wrap-break-word'>
            {preview.household.name}
          </p>
        </div>

        <div className='flex items-center justify-between gap-3 py-3'>
          <div className='grid gap-1'>
            <span className='flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground'>
              <ShieldCheck aria-hidden className='size-3.5 opacity-60' />
              {t('invitations.roleLabel')}
            </span>
            <p className='text-sm font-semibold'>{roleLabel}</p>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase',
              preview.invitedRole === 'admin'
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                : 'border-border bg-muted text-muted-foreground',
            )}>
            {roleLabel}
          </span>
        </div>

        <div className='grid gap-1 py-3 last:pb-0'>
          <span className='flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground'>
            <Clock3 aria-hidden className='size-3.5 opacity-60' />
            {t('invitations.expiresAt')}
          </span>
          <p className='text-sm font-semibold tabular-nums'>{expiresLabel}</p>
        </div>
      </CardContent>

      {!isAuthenticated ? (
        <div className='border-t border-border/60 px-(--card-spacing) pt-(--card-spacing)'>
          <p className='rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'>
            {t('invitations.requiresAuth')}
          </p>
        </div>
      ) : null}
    </Card>
  )
}

function InvalidTokenCard() {
  const { t } = useTranslation()

  return (
    <Card size='sm'>
      <CardHeader>
        <div className='flex items-start gap-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
            <AlertTriangle aria-hidden className='size-5' />
          </span>
          <div className='min-w-0 flex-1'>
            <CardTitle>{t('invitations.invalidTokenTitle')}</CardTitle>
            <CardDescription className='mt-1'>
              {t('invitations.invalidTokenDesc')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page — smart shell (query + mutation + navigation + footer)
// ---------------------------------------------------------------------------

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

  if (!token) {
    return (
      <TmaPageShell
        contentClassName='gap-4'
        title={t('invitations.acceptTitle')}>
        <InvalidTokenCard />
      </TmaPageShell>
    )
  }

  const canShowAcceptCta =
    Boolean(token) && isAuthenticated && Boolean(previewQuery.data)
  const isBusy = acceptMutation.isPending

  const footer = canShowAcceptCta ? (
    <TmaPageFooter>
      <TmaHapticButton
        aria-busy={isBusy}
        disabled={isBusy}
        onClick={() => {
          void handleAccept()
        }}>
        {isBusy ? t('invitations.accepting') : t('invitations.acceptAction')}
      </TmaHapticButton>
    </TmaPageFooter>
  ) : undefined

  return (
    <TmaPageShell
      contentClassName='gap-4'
      footer={footer}
      title={t('invitations.acceptTitle')}>
      <QueryState
        empty={{
          title: t('invitations.notFoundTitle'),
          description: t('invitations.notFoundDesc'),
        }}
        error={{
          title: t('invitations.loadError'),
          description: t('invitations.loadErrorDesc'),
        }}
        isEmpty={(data: InvitationPreviewResponse | undefined) => !data}
        pending={{
          title: t('invitations.loading'),
          description: t('invitations.loadingDesc'),
        }}
        query={previewQuery}
        variant='card'>
        {(preview) => (
          <InvitationPreviewCard
            isAuthenticated={isAuthenticated}
            preview={preview}
          />
        )}
      </QueryState>
    </TmaPageShell>
  )
}
