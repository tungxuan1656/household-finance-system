import { create } from 'zustand'

import {
  createCurrentMonthPeriodSelection,
  type PeriodSelection,
} from '@/lib/period'

type PeriodState = {
  selectedPeriod: PeriodSelection
  setSelectedPeriod: (selectedPeriod: PeriodSelection) => void
  reset: () => void
}

export const buildInitialPeriodSelection = (): PeriodSelection =>
  createCurrentMonthPeriodSelection()

export const usePeriodStore = create<PeriodState>((set) => ({
  selectedPeriod: buildInitialPeriodSelection(),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  reset: () => set({ selectedPeriod: buildInitialPeriodSelection() }),
}))

export const getPeriodStoreSnapshot = () => usePeriodStore.getState()
