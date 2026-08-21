import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { useHouseholdsQuery } from '@/features/home/api'

import { useExpenseGroupDetailQuery, useGroupSummaryQuery } from '../api'

type GroupPageFeedback = {
  message: string
  tone: 'error' | 'success'
}

export const useGroupDetail = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { t } = useTranslation()
  const groupQuery = useExpenseGroupDetailQuery(id)
  const summaryQuery = useGroupSummaryQuery(id)
  const householdsQuery = useHouseholdsQuery()
  const [feedback] = useState<GroupPageFeedback | null>(
    () =>
      (location.state as { feedback?: GroupPageFeedback } | null)?.feedback ??
      null,
  )

  const householdNameById = useMemo(
    () =>
      new Map(
        (householdsQuery.data?.items ?? []).map((household) => [
          household.id,
          household.name,
        ]),
      ),
    [householdsQuery.data?.items],
  )

  return {
    id,
    t,
    groupQuery,
    summaryQuery,
    householdsQuery,
    householdNameById,
    feedback,
  }
}
