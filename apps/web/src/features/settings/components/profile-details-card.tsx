'use client'

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
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ProfileDisplayNameForm } from '@/features/settings/components/profile-display-name-form'
import { t } from '@/lib/i18n/t'

type Props = {
  defaultDisplayName: string | null
  email: string | null
  isBusy: boolean
  onDisplayNameSubmit: (displayName: string) => Promise<void>
}

export const ProfileDetailsCard = ({
  defaultDisplayName,
  email,
  isBusy,
  onDisplayNameSubmit,
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('app.settings.profile.accountDetailsTitle')}</CardTitle>
        <CardDescription>
          {t('app.settings.profile.accountDetailsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        <Field>
          <FieldLabel htmlFor='profile-email'>
            {t('app.settings.account.fields.email')}
          </FieldLabel>
          <FieldContent>
            <Input
              readOnly
              id='profile-email'
              size={'sm'}
              value={email ?? ''}
            />
            <FieldDescription>
              {t('app.settings.profile.emailReadonly')}
            </FieldDescription>
          </FieldContent>
        </Field>

        <ProfileDisplayNameForm
          defaultDisplayName={defaultDisplayName}
          isSubmitting={isBusy}
          onSubmit={onDisplayNameSubmit}
        />
      </CardContent>
    </Card>
  )
}
