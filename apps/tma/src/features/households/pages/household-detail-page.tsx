import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { TrashIcon } from '@/components/shared/tma-icons'
import { TmaPageShell } from '@/components/shared/tma-page-shell'
import {
  Avatar,
  Button,
  Card,
  CardDescription,
  CardTitle,
  DataState,
  Field,
  FieldLabel,
  Input,
  Section,
  SectionHeader,
} from '@/components/ui'
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
          <CardTitle>{t('households.detail.invalidIdTitle')}</CardTitle>
          <CardDescription>
            {t('households.detail.invalidIdDesc')}
          </CardDescription>
        </Card>
      </TmaPageShell>
    )
  }

  return (
    <TmaPageShell title={t('households.detail.title')}>
      {feedback ? (
        <Card
          className={
            feedback.tone === 'error'
              ? 'mb-3 border-[#d93838]/20 bg-[#ffeded]/90'
              : 'mb-3 border-tma-positive/20 bg-tma-positive/10'
          }>
          <CardDescription
            className={
              feedback.tone === 'error' ? 'text-[#d93838]' : 'text-[#2f9b44]'
            }>
            {feedback.message}
          </CardDescription>
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

            <Card className='mt-3 grid gap-3'>
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

              <form className='grid gap-3.5' onSubmit={handleSave}>
                <Field>
                  <FieldLabel>{t('households.detail.fieldName')}</FieldLabel>
                  <Input
                    disabled={!isAdmin || isBusy}
                    placeholder={t('households.detail.namePlaceholder')}
                    type='text'
                    value={draftName}
                    onChange={(event) => {
                      setDraftName(event.target.value)
                      setFeedback(null)
                    }}
                  />
                </Field>

                {isAdmin ? (
                  <div className='flex justify-end'>
                    <Button disabled={isBusy} type='submit' variant='secondary'>
                      {isBusy
                        ? t('households.detail.saving')
                        : t('households.detail.save')}
                    </Button>
                  </div>
                ) : null}
              </form>
            </Card>

            <HomeRecentExpensesSection
              dateFrom={selectedPeriod.dateFrom}
              dateTo={selectedPeriod.dateTo}
              householdId={id}
              showHouseholdLabel={false}
              title={t('households.detail.sectionRecent')}
              viewAllState={{ appliedHouseholdId: id }}
            />

            <Section>
              <SectionHeader title={t('households.detail.sectionMembers')} />
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
                <Card className='grid gap-2'>
                  {members.map((member) => (
                    <article
                      key={member.userId}
                      className='flex items-center gap-3'>
                      <Avatar
                        alt={member.name}
                        fallback={getHouseholdAvatarFallback(member.name)}
                        size='sm'
                        src={member.avatarUrl}
                      />
                      <div className='min-w-0 flex-1'>
                        <h3
                          className={
                            member.role === 'admin'
                              ? 'm-0 text-sm font-semibold text-[#d3a10c]'
                              : 'm-0 text-sm font-semibold text-tma-text-strong'
                          }>
                          {member.name ||
                            user?.displayName ||
                            t('households.detail.memberFallback')}
                        </h3>
                        <CardDescription className='text-xs'>
                          {getHouseholdRoleLabel(member.role, t)}
                        </CardDescription>
                      </div>
                      {isAdmin && member.userId !== user?.id ? (
                        <button
                          className='shrink-0 rounded-full p-2 text-tma-text-muted transition active:scale-90 active:text-[#d93838]'
                          disabled={isRemoving}
                          type='button'
                          onClick={() =>
                            handleRemoveMember(member.userId, member.name)
                          }>
                          <TrashIcon
                            className='size-4.5'
                            height={18}
                            strokeWidth={1.8}
                            width={18}
                          />
                        </button>
                      ) : null}
                    </article>
                  ))}
                </Card>
              </DataState>
            </Section>

            {isAdmin ? (
              <Section>
                <SectionHeader
                  action={
                    <Button
                      size='sm'
                      variant='primary'
                      onClick={() => {
                        setShowInviteDialog((prev) => !prev)
                      }}>
                      {showInviteDialog
                        ? t('common.close')
                        : t('households.detail.inviteAction')}
                    </Button>
                  }
                  title={t('households.detail.sectionInvite')}
                />
                {showInviteDialog ? (
                  <InviteHouseholdDialog
                    householdId={id}
                    householdName={household.name}
                    onClose={() => {
                      setShowInviteDialog(false)
                    }}
                  />
                ) : null}
              </Section>
            ) : null}
          </>
        ) : null}
      </DataState>
    </TmaPageShell>
  )
}
