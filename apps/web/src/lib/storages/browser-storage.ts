type BrowserStorageMethod = 'clear' | 'getItem' | 'removeItem' | 'setItem'

const getBrowserStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

const callStorageMethod = <ReturnType>(
  method: BrowserStorageMethod,
  args: unknown[],
): ReturnType | null => {
  const storage = getBrowserStorage()

  if (!storage) {
    return null
  }

  const prototypeMethod = (
    Storage.prototype as Record<BrowserStorageMethod, unknown>
  )[method]

  if (typeof prototypeMethod === 'function') {
    try {
      return Reflect.apply(
        prototypeMethod as (...methodArgs: unknown[]) => ReturnType,
        storage,
        args,
      )
    } catch {
      // Some jsdom/vitest storage shims expose a broken Storage receiver.
      // Fall through to the best-effort object method or a no-op return.
    }
  }

  const storageMethod = storage[method] as unknown

  if (typeof storageMethod === 'function') {
    try {
      return Reflect.apply(
        storageMethod as (...methodArgs: unknown[]) => ReturnType,
        storage,
        args,
      )
    } catch {
      return null
    }
  }

  return null
}

export const readLocalStorageItem = (key: string) =>
  callStorageMethod<string | null>('getItem', [key])

export const writeLocalStorageItem = (key: string, value: string) => {
  callStorageMethod<void>('setItem', [key, value])
}

export const removeLocalStorageItem = (key: string) => {
  callStorageMethod<void>('removeItem', [key])
}

export const clearLocalStorage = () => {
  callStorageMethod<void>('clear', [])
}
