'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  type CreateHouseholdFormValues,
  createHouseholdSchema,
} from '@/features/households/lib/forms/household.schema'
import {
  acceptInvitation,
  getInvitationPreview,
} from '@/features/invitations/api/invitation'
import type { InvitationPreviewResponse } from '@/features/invitations/types/invitation'
import { CreateHouseholdForm } from '@/features/onboarding/components/create-household-form'
import { JoinHouseholdCard } from '@/features/onboarding/components/join-household-card'
import { OnboardingCompleteCard } from '@/features/onboarding/components/onboarding-complete-card'
import { normalizeInviteToken } from '@/features/onboarding/utils/invite-token'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'

type OnboardingMode = 'create' | 'join'
type OnboardingStage = 'setup' | 'complete'

function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLoading = useHouseholdStore.use.isLoading()
  const households = useHouseholdStore.use.households()
  const currentHousehold = useHouseholdStore.use.currentHousehold()
  const [mode, setMode] = useState<OnboardingMode>('create')
  const [inviteToken, setInviteToken] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false)
  const [invitePreview, setInvitePreview] =
    useState<InvitationPreviewResponse | null>(null)
  const [previewToken, setPreviewToken] = useState('')
  const [completedHouseholdId, setCompletedHouseholdId] = useState<
    string | null
  >(null)
  const [stage, setStage] = useState<OnboardingStage>('setup')
  const form = useForm<CreateHouseholdFormValues>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(createHouseholdSchema),
  })

  const activeHouseholdId = useMemo(
    () =>
      completedHouseholdId ?? currentHousehold?.id ?? households[0]?.id ?? null,
    [completedHouseholdId, currentHousehold?.id, households],
  )

  useEffect(() => {
    if (households.length > 0 && stage === 'setup') {
      router.replace(PATHS.HOUSEHOLDS)
    }
  }, [households.length, router, stage])

  useEffect(() => {
    const deepLinkInviteToken = normalizeInviteToken(
      searchParams.get('inviteToken') || searchParams.get('from') || '',
    )

    if (!deepLinkInviteToken) {
      return
    }

    setInvitePreview(null)
    setMode('join')
    setInviteToken(deepLinkInviteToken)
  }, [searchParams])

  const onSubmit = async (values: CreateHouseholdFormValues) => {
    try {
      const household = await householdActions.createHousehold(values)

      toast.success(t('app.onboarding.feedback.createSuccess'))
      setCompletedHouseholdId(household.id)
      setStage('complete')
    } catch {
      toast.error(t('app.onboarding.feedback.createFailed'))
    }
  }

  const handlePreviewInvite = async () => {
    try {
      setIsPreviewLoading(true)

      const normalizedInviteToken = normalizeInviteToken(inviteToken)

      const preview = await getInvitationPreview(normalizedInviteToken)
      setInvitePreview(preview)
      setPreviewToken(normalizedInviteToken)
    } catch {
      setInvitePreview(null)
      setPreviewToken('')
      toast.error(t('app.invitationAccept.feedback.loadFailed'))
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    try {
      setIsAcceptingInvite(true)

      const normalizedInviteToken = normalizeInviteToken(inviteToken)

      const result = await acceptInvitation(normalizedInviteToken)
      setCompletedHouseholdId(result.householdId)
      setStage('complete')
      toast.success(t('app.invitationAccept.feedback.acceptSuccess'))
    } catch {
      toast.error(t('app.invitationAccept.feedback.acceptFailed'))
    } finally {
      setIsAcceptingInvite(false)
    }
  }

  if (stage === 'complete') {
    return <OnboardingCompleteCard activeHouseholdId={activeHouseholdId} />
  }

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col gap-4'>
      <header className='mb-6 space-y-2'>
        <h1 className='font-heading text-2xl tracking-tight'>
          {t('app.onboarding.title')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('app.onboarding.description')}
        </p>
      </header>

      <div className='flex gap-3'>
        <Button
          type='button'
          variant={mode === 'create' ? 'default' : 'outline'}
          onClick={() => setMode('create')}>
          {t('app.onboarding.actions.createPath')}
        </Button>
        <Button
          type='button'
          variant={mode === 'join' ? 'default' : 'outline'}
          onClick={() => setMode('join')}>
          {t('app.onboarding.actions.joinPath')}
        </Button>
      </div>

      {mode === 'create' ? (
        <CreateHouseholdForm
          form={form}
          isLoading={isLoading}
          onSubmit={onSubmit}
        />
      ) : (
        <JoinHouseholdCard
          invitePreview={invitePreview}
          inviteToken={inviteToken}
          isAcceptingInvite={isAcceptingInvite}
          isPreviewLoading={isPreviewLoading}
          previewToken={previewToken}
          onAcceptInvite={() => void handleAcceptInvite()}
          onInviteTokenChange={(value) => {
            setInviteToken(value)
            setInvitePreview(null)
          }}
          onPreviewInvite={() => void handlePreviewInvite()}
        />
      )}
    </div>
  )
}

export { OnboardingPage }
