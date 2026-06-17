import { type FormEvent } from 'react'

import {
  useRemoveHouseholdMemberMutation,
  useUpdateHouseholdMutation,
} from '../api'
import type { HouseholdDTO } from '../types'

export type HouseholdPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

type UseHouseholdDetailActionsOptions = {
  draftName: string
  household: HouseholdDTO | undefined
  id: string | undefined
  isAdmin: boolean
  onFeedback: (feedback: HouseholdPageFeedback) => void
  t: (key: string, options?: Record<string, unknown>) => string
}

export function useHouseholdDetailActions({
  draftName,
  household,
  id,
  isAdmin,
  onFeedback,
  t,
}: UseHouseholdDetailActionsOptions) {
  const updateHouseholdMutation = useUpdateHouseholdMutation()
  const removeMemberMutation = useRemoveHouseholdMemberMutation()

  const handleAvatarUploaded = async (avatarUrl: string) => {
    if (!id) return

    await updateHouseholdMutation.mutateAsync({
      householdId: id,
      payload: { avatarUrl },
    })

    onFeedback({
      message: t('households.detail.avatarUpdated'),
      tone: 'success',
    })
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!id || !household || !isAdmin) return

    const normalizedName = draftName.trim()
    if (!normalizedName) {
      onFeedback({
        message: t('households.createPage.validation.nameRequired'),
        tone: 'error',
      })

      return
    }

    try {
      if (normalizedName === household.name) {
        onFeedback({
          message: t('households.detail.noChanges'),
          tone: 'success',
        })

        return
      }

      await updateHouseholdMutation.mutateAsync({
        householdId: id,
        payload: { name: normalizedName },
      })

      onFeedback({
        message: t('households.detail.updated'),
        tone: 'success',
      })
    } catch (error) {
      onFeedback({
        message:
          error instanceof Error
            ? error.message
            : t('households.detail.updateError'),
        tone: 'error',
      })
    }
  }

  const handleRemoveMember = (memberUserId: string, memberName: string) => {
    if (!id) return

    const confirmed = window.confirm(
      t('households.detail.removeMemberConfirm', {
        name: memberName || t('groups.detail.memberFallback'),
      }),
    )
    if (!confirmed) return

    removeMemberMutation.mutate(
      { householdId: id, userId: memberUserId },
      {
        onSuccess: () => {
          onFeedback({
            message: t('households.detail.memberRemoved'),
            tone: 'success',
          })
        },
        onError: (error) => {
          onFeedback({
            message:
              error instanceof Error
                ? error.message
                : t('households.detail.removeMemberError'),
            tone: 'error',
          })
        },
      },
    )
  }

  return {
    handleAvatarUploaded,
    handleSave,
    handleRemoveMember,
    isBusy: updateHouseholdMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
  }
}
