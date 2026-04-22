import type { StoreApi, UseBoundStore } from 'zustand'

type StoreSelectors<T extends object> = {
  [K in keyof T]: () => T[K]
}

type StoreWithSelectors<T extends object> = UseBoundStore<StoreApi<T>> & {
  use: StoreSelectors<T>
}

function createSelectors<T extends object>(store: UseBoundStore<StoreApi<T>>) {
  const typedStore = store as StoreWithSelectors<T>

  typedStore.use = {} as StoreSelectors<T>

  for (const key of Object.keys(store.getState()) as Array<keyof T>) {
    typedStore.use[key] = () => store((state) => state[key])
  }

  return typedStore
}

export { createSelectors }
