'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProfileAvatarSection } from '@/features/settings/components/profile-avatar-section'
import { t } from '@/lib/i18n/t'

export const ProfileAvatarCard = (
  props: React.ComponentProps<typeof ProfileAvatarSection>,
) => (
  <Card>
    <CardHeader>
      <CardTitle>{t('app.settings.profile.title')}</CardTitle>
      <CardDescription>{t('app.settings.profile.description')}</CardDescription>
    </CardHeader>
    <CardContent>
      <ProfileAvatarSection {...props} />
    </CardContent>
  </Card>
)
