'use client'

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
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { t } from '@/lib/i18n/t'
import type { InvitationPreviewResponse } from '@/types/invitation'
import { normalizeInviteToken } from '@/views/app/onboarding/invite-token'

interface JoinHouseholdCardProps {
  inviteToken: string
  invitePreview: InvitationPreviewResponse | null
  isAcceptingInvite: boolean
  isPreviewLoading: boolean
  previewToken: string
  onAcceptInvite: () => void
  onInviteTokenChange: (value: string) => void
  onPreviewInvite: () => void
}

function JoinHouseholdCard({
  inviteToken,
  invitePreview,
  isAcceptingInvite,
  isPreviewLoading,
  previewToken,
  onAcceptInvite,
  onInviteTokenChange,
  onPreviewInvite,
}: JoinHouseholdCardProps) {
  return (
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
                placeholder={t('app.onboarding.fields.inviteToken.placeholder')}
                value={inviteToken}
                onChange={(event) => {
                  onInviteTokenChange(event.target.value)
                }}
              />
            </FieldContent>
          </Field>
        </FieldGroup>

        <div className='flex justify-end'>
          <Button
            disabled={isPreviewLoading || inviteToken.trim().length === 0}
            type='button'
            onClick={onPreviewInvite}>
            {t('app.onboarding.actions.previewInvite')}
          </Button>
        </div>

        {invitePreview && previewToken === normalizeInviteToken(inviteToken) ? (
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
                onClick={onAcceptInvite}>
                {isAcceptingInvite
                  ? t('app.invitationAccept.actions.accepting')
                  : t('app.onboarding.actions.acceptInvite')}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { JoinHouseholdCard }
