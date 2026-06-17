import { useEffect, useEffectEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { TmaPageShell } from '@/components/shared/tma-page-shell'
import { PeriodPickerSection } from '@/features/period/components/period-picker-section'
import { TMA_PATHS } from '@/lib/constants/routes'
import { type PeriodSelection } from '@/lib/period'
import {
  hideBottomButton,
  setBottomButton,
  updateBottomButton,
} from '@/lib/telegram/bottom-button'

import { usePeriodStore } from '../store'

interface PeriodPickerLocationState {
  backTo?: string
  initialPeriod?: PeriodSelection | null
}

export const PeriodPickerPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedPeriod = usePeriodStore((state) => state.selectedPeriod)
  const setSelectedPeriod = usePeriodStore((state) => state.setSelectedPeriod)

  const locationState = (location.state ??
    null) as PeriodPickerLocationState | null
  const isSubPage = locationState?.initialPeriod !== undefined
  const initialPeriodFromState = locationState?.initialPeriod
  const initialPeriod =
    initialPeriodFromState !== undefined && initialPeriodFromState !== null
      ? initialPeriodFromState
      : selectedPeriod

  const [candidate, setCandidate] = useState<PeriodSelection>(initialPeriod)

  useEffect(() => {
    if (isSubPage) {
      return
    }

    setCandidate(selectedPeriod)
  }, [selectedPeriod, isSubPage])

  const handleApply = useEffectEvent(() => {
    const backTo = locationState?.backTo ?? TMA_PATHS.root

    if (isSubPage) {
      navigate(backTo, {
        replace: true,
        state: {
          ...(locationState ?? {}),
          appliedPeriod: candidate,
        },
      })

      return
    }

    setSelectedPeriod(candidate)

    if ((window.history.state as { idx?: number } | null)?.idx) {
      navigate(-1)

      return
    }

    navigate(backTo, { replace: true })
  })

  useEffect(() => {
    const cleanup = setBottomButton({
      text: 'Chọn',
      enabled: true,
      showProgress: false,
      onClick: () => {
        handleApply()
      },
    })

    return () => {
      cleanup()
      hideBottomButton()
    }
  }, [])

  useEffect(() => {
    updateBottomButton({
      text: 'Chọn',
      enabled: true,
      showProgress: false,
    })
  }, [candidate])

  return (
    <TmaPageShell reserveBottomButton title='Chọn kỳ'>
      <PeriodPickerSection
        value={candidate}
        onChange={(next) => {
          if (next) {
            setCandidate(next)
          }
        }}
      />
    </TmaPageShell>
  )
}
