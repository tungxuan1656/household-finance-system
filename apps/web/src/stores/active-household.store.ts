import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { createSelectors } from '@/stores/types'

type ActiveHouseholdState = {
  activeHouseholdId: string | null
}

const initialState: ActiveHouseholdState = {
  activeHouseholdId: null,
}

const _useActiveHouseholdStore = create<ActiveHouseholdState>()(
  devtools(
    persist(() => initialState, {
      name: 'active-household-store',
      partialize: (state) => ({
        activeHouseholdId: state.activeHouseholdId,
      }),
      storage: createJSONStorage(() => localStorage),
    }),
    {
      name: 'active-household-store',
    },
  ),
)

const activeHouseholdActions = {
  clearActiveHousehold: () =>
    _useActiveHouseholdStore.setState({ activeHouseholdId: null }),
  reset: () => {
    _useActiveHouseholdStore.setState(initialState)
    void _useActiveHouseholdStore.persist.clearStorage()
  },
  setActiveHouseholdId: (activeHouseholdId: string) =>
    _useActiveHouseholdStore.setState({ activeHouseholdId }),
}

const useActiveHouseholdStore = createSelectors(_useActiveHouseholdStore)

export { activeHouseholdActions, useActiveHouseholdStore }
