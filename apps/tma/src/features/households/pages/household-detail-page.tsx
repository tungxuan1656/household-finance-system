import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { DataState } from '@/components/shared/data-state'
import { TmaHapticButton } from '@/components/shared/tma-haptic-button'
import { TrashIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/auth-provider'
import { HomeRecentExpensesSection } from '@/features/home/components/home-recent-expenses-section'
import { InviteHouseholdDialog } from '@/features/invitations/components/invite-household-dialog'
import { usePeriodStore } from '@/features/period/store'

import { useHouseholdDetailQuery, useHouseholdMembersQuery } from '../api'
import { HouseholdAvatarSection } from '../components/household-avatar-section'
import { HouseholdOverviewSection } from '../components/household-overview-section'
import { useHouseholdDetailActions } from '../hooks/use-household-detail-actions'
import {
  formatMemberCountLabel,
  getHouseholdAvatarFallback,
  getHouseholdRoleLabel,
} from '../presentation'

type HouseholdPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

export const HouseholdDetailPage = () => {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { t } = useTranslation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const householdQuery = useHouseholdDetailQuery(id)
  const membersQuery = useHouseholdMembersQuery(id)
  const [draftName, setDraftName] = useState('')
  const [feedback, setFeedback] = useState<HouseholdPageFeedback | null>(
    () =>
      (location.state as { feedback?: HouseholdPageFeedback } | null)
        ?.feedback ?? null,
  )
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const household = householdQuery.data
  const members = membersQuery.data?.items ?? []
  const isAdmin = household?.role === 'admin'
  const isHouseholdMissing =
    !householdQuery.isLoading && !householdQuery.isError && !household

  const {
    handleAvatarUploaded,
    handleSave,
    handleRemoveMember,
    isBusy,
    isRemoving,
  } = useHouseholdDetailActions({
    draftName,
    household,
    id,
    isAdmin,
    onFeedback: setFeedback,
    t,
  })

  useEffect(() => {
    if (household) setDraftName(household.name)
  }, [household])

  const memberSummary = useMemo(
    () => formatMemberCountLabel(members.length, t),
    [members.length, t],
  )

  if (!id) {
    return (
      <TmaPageShell title={t('households.detail.title')}>
        <Card>
          <CardHeader>
            <CardTitle>{t('households.detail.invalidIdTitle')}</CardTitle>
            <CardDescription>
              {t('households.detail.invalidIdDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('households.detail.title')}>
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

      <DataState
        emptyDescription={t('households.detail.notFoundDesc')}
        emptyTitle={t('households.detail.notFoundTitle')}
        errorDescription={t('households.detail.loadErrorDesc')}
        errorTitle={t('households.detail.loadError')}
        isEmpty={isHouseholdMissing}
        isError={householdQuery.isError && !household}
        isLoading={householdQuery.isLoading && !household}
        loadingDescription={t('households.detail.loadingDesc')}
        loadingTitle={t('households.detail.loading')}
        retryAction={householdQuery.refetch}>
        {household ? (
          <>
            <HouseholdOverviewSection householdId={id} />

            <Card>
              <CardContent className='grid gap-3'>
                <HouseholdAvatarSection
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

                <form className='grid gap-3' onSubmit={handleSave}>
                  <FieldGroup>
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
                    <div className='flex justify-end'>
                      <TmaHapticButton
                        aria-busy={isBusy}
                        disabled={isBusy}
                        type='submit'
                        variant='secondary'>
                        {isBusy
                          ? t('households.detail.saving')
                          : t('households.detail.save')}
                      </TmaHapticButton>
                    </div>
                  ) : null}
                </form>
              </CardContent>
            </Card>

            <HomeRecentExpensesSection
              dateFrom={selectedPeriod.dateFrom}
              dateTo={selectedPeriod.dateTo}
              householdId={id}
              showHouseholdLabel={false}
              title={t('households.detail.sectionRecent')}
              viewAllState={{ appliedHouseholdId: id }}
            />

            <section className='grid gap-3'>
              <h2 className='m-0 text-base font-bold'>
                {t('households.detail.sectionMembers')}
              </h2>
              <DataState
                emptyDescription={t('households.detail.emptyMembersDesc')}
                emptyTitle={t('households.detail.emptyMembersTitle')}
                errorDescription={t('households.detail.membersLoadErrorDesc')}
                errorTitle={t('households.detail.membersLoadError')}
                isEmpty={
                  !membersQuery.isLoading &&
                  !membersQuery.isError &&
                  members.length === 0
                }
                isError={membersQuery.isError && members.length === 0}
                isLoading={membersQuery.isLoading && members.length === 0}
                loadingDescription={t('households.detail.membersLoadingDesc')}
                loadingTitle={t('households.detail.membersLoading')}
                retryAction={membersQuery.refetch}>
                <Card>
                  <CardContent className='grid gap-2'>
                    {members.map((member) => (
                      <article
                        key={member.userId}
                        className='flex items-center gap-3'>
                        <Avatar size='sm'>
                          <AvatarImage
                            alt={member.name}
                            src={member.avatarUrl ?? undefined}
                          />
                          <AvatarFallback>
                            {getHouseholdAvatarFallback(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1'>
                          <h3 className='m-0 text-sm font-semibold text-foreground'>
                            {member.name ||
                              user?.displayName ||
                              t('households.detail.memberFallback')}
                          </h3>
                          <div className='flex items-center gap-2'>
                            <Badge variant='secondary'>
                              {getHouseholdRoleLabel(member.role, t)}
                            </Badge>
                            {member.role === 'admin' ? (
                              <Badge variant='outline'>
                                {t('households.roleAdmin')}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        {isAdmin && member.userId !== user?.id ? (
                          <Button
                            aria-label={t('households.detail.removeMember')}
                            disabled={isRemoving}
                            size='icon-sm'
                            type='button'
                            variant='ghost'
                            onClick={() =>
                              handleRemoveMember(member.userId, member.name)
                            }>
                            <TrashIcon
                              height={18}
                              strokeWidth={1.8}
                              width={18}
                            />
                          </Button>
                        ) : null}
                      </article>
                    ))}
                  </CardContent>
                </Card>
              </DataState>
            </section>

            {isAdmin ? (
              <section className='grid gap-3'>
                <div className='flex items-center justify-between gap-3'>
                  <h2 className='m-0 text-base font-bold'>
                    {t('households.detail.sectionInvite')}
                  </h2>
                  <TmaHapticButton
                    size='sm'
                    variant='default'
                    onClick={() => {
                      setShowInviteDialog((prev) => !prev)
                    }}>
                    {showInviteDialog
                      ? t('common.close')
                      : t('households.detail.inviteAction')}
                  </TmaHapticButton>
                </div>
                {showInviteDialog ? (
                  <InviteHouseholdDialog
                    householdId={id}
                    householdName={household.name}
                    onClose={() => {
                      setShowInviteDialog(false)
                    }}
                  />
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
