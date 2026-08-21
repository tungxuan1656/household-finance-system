import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { HomeRecentExpensesSection } from '@/features/home/components/home-recent-expenses-section'
import { InviteHouseholdDialog } from '@/features/invitations/components/invite-household-dialog'
import { usePeriodStore } from '@/features/period/store'

import { useHouseholdMembersQuery } from '../api'
import { useHouseholdDetailActions } from '../hooks/use-household-detail-actions'
import { formatMemberCountLabel, getHouseholdRoleLabel } from '../presentation'
import type { HouseholdDTO } from '../types'
import { HouseholdAvatarSection } from './household-avatar-section'
import { HouseholdMembersSection } from './household-members-section'
import { HouseholdOverviewSection } from './household-overview-section'

type HouseholdPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

type HouseholdDetailContentProps = {
  household: HouseholdDTO
  householdId: string
}

export const HouseholdDetailContent = ({
  household,
  householdId,
}: HouseholdDetailContentProps) => {
  const { t } = useTranslation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const [draftName, setDraftName] = useState(household.name)
  const [feedback, setFeedback] = useState<HouseholdPageFeedback | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const isAdmin = household.role === 'admin'

  const { handleAvatarUploaded, handleSave, isBusy } =
    useHouseholdDetailActions({
      draftName,
      household,
      id: householdId,
      isAdmin,
      onFeedback: setFeedback,
      t,
    })

  useEffect(() => {
    setDraftName(household.name)
  }, [household.name])

  const membersQuery = useHouseholdMembersQuery(householdId)
  const memberCount = membersQuery.data?.items.length ?? 0
  const memberSummary = useMemo(
    () => formatMemberCountLabel(memberCount, t),
    [memberCount, t],
  )

  return (
    <div className='space-y-4'>
      {feedback ? (
        <Card
          aria-live='polite'
          className={
            feedback.tone === 'error'
              ? 'border-destructive/30 bg-destructive/5'
              : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
          }
          role='status'>
          <CardHeader className='py-3'>
            <CardDescription
              className={
                feedback.tone === 'error'
                  ? 'font-medium text-destructive'
                  : 'font-medium text-emerald-700 dark:text-emerald-300'
              }>
              {feedback.message}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <HouseholdOverviewSection householdId={householdId} />

      <Card>
        <CardHeader>
          <CardTitle>{t('households.detail.sectionSettings')}</CardTitle>
          <CardDescription>{t('households.detail.imageHelp')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          <HouseholdAvatarSection
            compact
            avatarUrl={household.avatarUrl}
            canEdit={isAdmin}
            helperText={t('households.detail.imageHelp')}
            householdName={household.name}
            isBusy={isBusy}
            readOnlyMessage={t('households.detail.adminOnly')}
            summaryText={`${memberSummary} · ${getHouseholdRoleLabel(household.role, t)}`}
            title={t('households.detail.sectionSettings')}
            onAvatarUploaded={handleAvatarUploaded}
          />
          {!isAdmin ? (
            <p className='text-sm text-muted-foreground'>
              {t('households.detail.adminOnly')}
            </p>
          ) : null}

          <form className='space-y-4' onSubmit={handleSave}>
            <FieldGroup className='gap-3'>
              <Field>
                <FieldLabel htmlFor='household-detail-name'>
                  {t('households.detail.fieldName')}
                </FieldLabel>
                <Input
                  disabled={!isAdmin || isBusy}
                  id='household-detail-name'
                  placeholder={t('households.detail.namePlaceholder')}
                  type='text'
                  value={draftName}
                  onChange={(event) => {
                    setDraftName(event.target.value)
                    setFeedback(null)
                  }}
                />
              </Field>
            </FieldGroup>

            {isAdmin ? (
              <CardFooter className='justify-end px-0 pt-2'>
                <TmaHapticButton
                  aria-busy={isBusy}
                  className='w-full sm:w-auto'
                  disabled={isBusy}
                  type='submit'
                  variant='default'>
                  {isBusy
                    ? t('households.detail.saving')
                    : t('households.detail.save')}
                </TmaHapticButton>
              </CardFooter>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className='[&>section]:mt-0'>
        <HomeRecentExpensesSection
          dateFrom={selectedPeriod.dateFrom}
          dateTo={selectedPeriod.dateTo}
          householdId={householdId}
          showHouseholdLabel={false}
          title={t('households.detail.sectionRecent')}
          viewAllState={{ appliedHouseholdId: householdId }}
        />
      </div>

      <HouseholdMembersSection householdId={householdId} isAdmin={isAdmin} />

      {isAdmin ? (
        <Card>
          <CardHeader className='flex-row items-center justify-between space-y-0'>
            <CardTitle className='text-base tracking-normal normal-case'>
              {t('households.detail.sectionInvite')}
            </CardTitle>
            <TmaHapticButton
              aria-expanded={showInviteDialog}
              className='gap-1.5'
              size='sm'
              variant={showInviteDialog ? 'secondary' : 'default'}
              onClick={() => {
                setShowInviteDialog((prev) => !prev)
              }}>
              {showInviteDialog
                ? t('common.close')
                : t('households.detail.inviteAction')}
              <span
                className={`inline-block text-[10px] transition-transform ${showInviteDialog ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </TmaHapticButton>
          </CardHeader>
          <div
            className={`grid transition-all duration-300 ease-out ${showInviteDialog ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className='overflow-hidden'>
              <CardContent className='pt-0'>
                <InviteHouseholdDialog
                  householdId={householdId}
                  householdName={household.name}
                  onClose={() => {
                    setShowInviteDialog(false)
                  }}
                />
              </CardContent>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
