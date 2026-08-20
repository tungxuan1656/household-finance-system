import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { getHouseholdDetailPath, TMA_PATHS } from '@/lib/constants/routes'

import { useCreateHouseholdMutation, useUpdateHouseholdMutation } from '../api'
import { HouseholdAvatarSection } from '../components/household-avatar-section'

type HouseholdPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

export const CreateHouseholdPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const createHouseholdMutation = useCreateHouseholdMutation()
  const updateHouseholdMutation = useUpdateHouseholdMutation()
  const [draftName, setDraftName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<HouseholdPageFeedback | null>(null)
  const isBusy =
    createHouseholdMutation.isPending || updateHouseholdMutation.isPending
  const normalizedName = draftName.trim()

  const handleAvatarUploaded = async (uploadedAvatarUrl: string) => {
    setAvatarUrl(uploadedAvatarUrl)

    setFeedback({
      message: t('households.createPage.imageReady'),
      tone: 'success',
    })
  }

  const handleCreateHousehold = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!normalizedName) {
      setFeedback({
        message: t('households.createPage.validation.nameRequired'),
        tone: 'error',
      })

      return
    }

    if (normalizedName.length > 120) {
      setFeedback({
        message: t('households.createPage.validation.nameMaxLength'),
        tone: 'error',
      })

      return
    }

    try {
      const created = await createHouseholdMutation.mutateAsync({
        name: normalizedName,
      })

      if (avatarUrl) {
        await updateHouseholdMutation.mutateAsync({
          householdId: created.id,
          payload: { avatarUrl },
        })
      }

      navigate(getHouseholdDetailPath(created.id), { replace: true })
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : t('households.createPage.createError'),
        tone: 'error',
      })
    }
  }

  return (
    <TmaPageShell title={t('households.createPage.title')}>
      {feedback ? (
        <Card>
          <CardHeader>
            <CardDescription
              className={
                feedback.tone === 'error'
                  ? 'text-destructive'
                  : 'text-emerald-600'
              }>
              {feedback.message}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardContent>
          <HouseholdAvatarSection
            canEdit
            avatarUrl={avatarUrl}
            helperText={t('households.createPage.imageHelp')}
            householdName={
              normalizedName || t('households.createPage.newHousehold')
            }
            isBusy={isBusy}
            title={t('households.createPage.fieldAvatar')}
            onAvatarUploaded={handleAvatarUploaded}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('households.createPage.fieldName')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='grid gap-3' onSubmit={handleCreateHousehold}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='create-household-name'>
                  {t('households.createPage.fieldName')}
                </FieldLabel>
                <Input
                  disabled={isBusy}
                  id='create-household-name'
                  maxLength={120}
                  placeholder={t('households.createPage.namePlaceholder')}
                  type='text'
                  value={draftName}
                  onChange={(event) => {
                    setDraftName(event.target.value)
                    setFeedback(null)
                  }}
                />
              </Field>
            </FieldGroup>

            <div className='flex flex-wrap justify-end gap-2.5'>
              <TmaHapticButton
                aria-busy={isBusy}
                disabled={isBusy}
                type='button'
                variant='ghost'
                onClick={() => navigate(TMA_PATHS.households)}>
                {t('common.cancel')}
              </TmaHapticButton>

              <TmaHapticButton
                aria-busy={isBusy}
                disabled={isBusy}
                type='submit'
                variant='secondary'>
                {isBusy
                  ? t('households.createPage.submitting')
                  : t('households.create')}
              </TmaHapticButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </TmaPageShell>
  )
}
