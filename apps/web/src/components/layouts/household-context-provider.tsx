import { createContext, type ReactNode, useContext, useEffect } from 'react'

import { useHouseholdsQuery } from '@/hooks/api/use-households'
import {
  activeHouseholdActions,
  useActiveHouseholdStore,
} from '@/stores/active-household.store'
import type { HouseholdDTO } from '@/types/household'

type HouseholdContextValue = {
  activeHousehold: HouseholdDTO | null
  activeHouseholdId: string | null
  households: HouseholdDTO[]
  isLoading: boolean
  setActiveHouseholdId: (householdId: string) => void
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null)

const resolveActiveHousehold = (
  households: HouseholdDTO[],
  activeHouseholdId: string | null,
) => {
  if (!activeHouseholdId) {
    return null
  }

  return (
    households.find((household) => household.id === activeHouseholdId) ?? null
  )
}

function HouseholdContextProvider({ children }: { children: ReactNode }) {
  const activeHouseholdId = useActiveHouseholdStore.use.activeHouseholdId()
  const householdsQuery = useHouseholdsQuery()
  const households = householdsQuery.data?.items ?? []

  useEffect(() => {
    if (!householdsQuery.isSuccess) {
      return
    }

    if (households.length === 0) {
      if (activeHouseholdId !== null) {
        activeHouseholdActions.clearActiveHousehold()
      }

      return
    }

    if (!activeHouseholdId) {
      activeHouseholdActions.setActiveHouseholdId(households[0].id)

      return
    }

    const hasActiveHousehold = households.some(
      (household) => household.id === activeHouseholdId,
    )

    if (!hasActiveHousehold) {
      activeHouseholdActions.setActiveHouseholdId(households[0].id)
    }
  }, [activeHouseholdId, households, householdsQuery.isSuccess])

  const activeHousehold = resolveActiveHousehold(households, activeHouseholdId)

  return (
    <HouseholdContext.Provider
      value={{
        activeHousehold,
        activeHouseholdId,
        households,
        isLoading: householdsQuery.isLoading,
        setActiveHouseholdId: (householdId: string) => {
          const hasHousehold = households.some(
            (household) => household.id === householdId,
          )

          if (!hasHousehold) {
            return
          }

          activeHouseholdActions.setActiveHouseholdId(householdId)
        },
      }}>
      {children}
    </HouseholdContext.Provider>
  )
}

const useHouseholdContext = (): HouseholdContextValue => {
  const context = useContext(HouseholdContext)

  if (!context) {
    throw new Error(
      'useHouseholdContext must be used within HouseholdContextProvider',
    )
  }

  return context
}

export { HouseholdContextProvider, useHouseholdContext }
