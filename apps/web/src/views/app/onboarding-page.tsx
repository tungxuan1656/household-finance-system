'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { acceptInvitation, getInvitationPreview } from '@/api/invitation'
import { QuickAddExpenseDialog } from '@/components/expense/quick-add-expense-dialog'
import { HouseholdInviteDialog } from '@/components/household/household-invite-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PATHS } from '@/lib/constants/paths'
import {
  type CreateHouseholdFormValues,
  createHouseholdSchema,
} from '@/lib/forms/household.schema'
import { t } from '@/lib/i18n/t'
import { householdActions, useHouseholdStore } from '@/stores/household.store'
import type { InvitationPreviewResponse } from '@/types/invitation'

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
  const [quickAddOpen, setQuickAddOpen] = useState(false)
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
    const deepLinkInviteToken = searchParams.get('inviteToken')?.trim()

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

      const preview = await getInvitationPreview(inviteToken)
      setInvitePreview(preview)
      setPreviewToken(inviteToken.trim())
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

      const result = await acceptInvitation(inviteToken)
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
    return (
      <div className='mx-auto flex w-full max-w-2xl flex-col gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>{t('app.onboarding.complete.title')}</CardTitle>
            <CardDescription>
              {t('app.onboarding.complete.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            {activeHouseholdId ? (
              <HouseholdInviteDialog householdId={activeHouseholdId} />
            ) : (
              <Button disabled type='button' variant='outline'>
                {t('app.onboarding.actions.openInviteMembers')}
              </Button>
            )}
            <Button asChild type='button' variant='outline'>
              <Link href={PATHS.BUDGETS}>
                {t('app.onboarding.actions.openBudgetSetup')}
              </Link>
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => setQuickAddOpen(true)}>
              {t('app.onboarding.actions.openQuickAdd')}
            </Button>
            <Button asChild type='button'>
              <Link href={PATHS.HOUSEHOLDS}>
                {t('app.onboarding.actions.finish')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <QuickAddExpenseDialog
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
        />
      </div>
    )
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
        <form
          className='rounded-none border border-border/70 bg-background/70 p-4 backdrop-blur sm:p-5'
          onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name='name'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='household-name'>
                    {t('app.onboarding.fields.householdName.label')}
                  </FieldLabel>
                  <FieldContent>
                    <FieldDescription>
                      {t('app.onboarding.fields.householdName.description')}
                    </FieldDescription>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id='household-name'
                      placeholder={t(
                        'app.onboarding.fields.householdName.placeholder',
                      )}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <div className='mt-5 flex items-center justify-end gap-3'>
            <Button disabled={isLoading} type='submit'>
              {isLoading
                ? t('app.onboarding.actions.creating')
                : t('app.onboarding.actions.create')}
            </Button>
          </div>
        </form>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('app.onboarding.join.title')}</CardTitle>
            <CardDescription>
              {t('app.onboarding.join.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='invite-token'>
                  {t('app.onboarding.fields.inviteToken.label')}
                </FieldLabel>
                <FieldContent>
                  <FieldDescription>
                    {t('app.onboarding.fields.inviteToken.description')}
                  </FieldDescription>
                  <Input
                    aria-invalid={false}
                    id='invite-token'
                    placeholder={t(
                      'app.onboarding.fields.inviteToken.placeholder',
                    )}
                    value={inviteToken}
                    onChange={(event) => {
                      setInviteToken(event.target.value)
                      setInvitePreview(null)
                    }}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className='flex justify-end'>
              <Button
                disabled={isPreviewLoading || inviteToken.trim().length === 0}
                type='button'
                onClick={() => void handlePreviewInvite()}>
                {t('app.onboarding.actions.previewInvite')}
              </Button>
            </div>

            {invitePreview && previewToken === inviteToken.trim() ? (
              <Card>
                <CardHeader>
                  <CardTitle>{invitePreview.household.name}</CardTitle>
                  <CardDescription>
                    {t('app.onboarding.join.previewDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    disabled={isAcceptingInvite}
                    type='button'
                    onClick={() => void handleAcceptInvite()}>
                    {isAcceptingInvite
                      ? t('app.invitationAccept.actions.accepting')
                      : t('app.onboarding.actions.acceptInvite')}
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { OnboardingPage }
