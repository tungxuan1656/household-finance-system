import * as React from 'react'

type ShellAccessActions = {
  grantShellAccess: () => void
  revokeShellAccess: () => void
}

const ShellAccessStateContext = React.createContext<boolean | undefined>(
  undefined,
)
const ShellAccessActionsContext = React.createContext<
  ShellAccessActions | undefined
>(undefined)

function ShellAccessProvider({ children }: { children: React.ReactNode }) {
  const [hasShellAccess, setHasShellAccess] = React.useState(false)

  const actions = React.useMemo(
    () => ({
      grantShellAccess: () => setHasShellAccess(true),
      revokeShellAccess: () => setHasShellAccess(false),
    }),
    [],
  )

  return (
    <ShellAccessStateContext.Provider value={hasShellAccess}>
      <ShellAccessActionsContext.Provider value={actions}>
        {children}
      </ShellAccessActionsContext.Provider>
    </ShellAccessStateContext.Provider>
  )
}

function useShellAccess() {
  const value = React.useContext(ShellAccessStateContext)

  if (value === undefined) {
    throw new Error('useShellAccess must be used within a ShellAccessProvider')
  }

  return value
}

function useShellAccessActions() {
  const value = React.useContext(ShellAccessActionsContext)

  if (value === undefined) {
    throw new Error(
      'useShellAccessActions must be used within a ShellAccessProvider',
    )
  }

  return value
}

export { ShellAccessProvider, useShellAccess, useShellAccessActions }
