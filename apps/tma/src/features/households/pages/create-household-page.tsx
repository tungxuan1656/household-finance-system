import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Button,
  Card,
  CardDescription,
  Field,
  FieldLabel,
  Input,
} from '@/components/ui'
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
        <Card
          className={
            feedback.tone === 'error'
              ? 'mt-3 border-[#d93838]/20 bg-[#ffeded]/90'
              : 'mt-3 border-tma-positive/20 bg-tma-positive/10'
          }>
          <CardDescription
            className={
              feedback.tone === 'error' ? 'text-[#d93838]' : 'text-[#2f9b44]'
            }>
            {feedback.message}
          </CardDescription>
        </Card>
      ) : null}

      <Card className='mt-3 grid gap-3'>
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
      </Card>

      <section className='mt-6'>
        <Card>
          <form className='grid gap-3.5' onSubmit={handleCreateHousehold}>
            <Field>
              <FieldLabel>{t('households.createPage.fieldName')}</FieldLabel>
              <Input
                disabled={isBusy}
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

            <div className='flex flex-wrap justify-end gap-2.5'>
              <Button
                disabled={isBusy}
                type='button'
                variant='ghost'
                onClick={() => navigate(TMA_PATHS.households)}>
                {t('common.cancel')}
              </Button>

              <Button disabled={isBusy} type='submit' variant='secondary'>
                {isBusy
                  ? t('households.createPage.submitting')
                  : t('households.create')}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </TmaPageShell>
  )
}
