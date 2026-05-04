'use client'

export const QUICK_ADD_TIMING_EVENT = 'expense:quick-add-timing'

export type QuickAddTimingMetric = {
  durationMs: number
  visibility: 'private' | 'household'
  wasHousehold: boolean
}

export const reportQuickAddTiming = (detail: QuickAddTimingMetric) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent<QuickAddTimingMetric>(QUICK_ADD_TIMING_EVENT, { detail }),
  )
}
