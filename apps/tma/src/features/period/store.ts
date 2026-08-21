/**
 * Period feature store — UI-only seam.
 *
 * Source of truth for period types/format/selectors/vietnam-time lives in
 * `src/lib/period/*` (re-exported via `src/lib/period.ts`). This file owns
 * only the Zustand selection state and imports `PeriodSelection` +
 * `createCurrentMonthPeriodSelection` from `lib/period`. No duplicate type
 * definitions are kept here; if a future need adds period logic, add it to
 * `lib/period` and re-export, keeping `features/period` as UI (components/
 * pages/store) only. Consolidation is complete — no file deletion needed.
 */
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
